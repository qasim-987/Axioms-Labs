import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env";
import { ContactPayload } from "../schemas/contact.schema";
import { sanitizePlainText } from "./antiSpam.service";

export interface StoredInquiry {
  id: string;
  receivedAt: string;
  clientName: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  source: string;
  messageLength: number;
  messagePreview: string;
  downstreamDelivered: boolean;
  deliveryChannels: string[];
}

const DATA_DIR = path.resolve(__dirname, "../../data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.jsonl");

let inquiryCountSession = 0;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function processAndDeliverInquiry(
  payload: ContactPayload
): Promise<StoredInquiry> {
  const id = `axs_${crypto.randomUUID().slice(0, 12)}`;
  const receivedAt = new Date().toISOString();
  const cleanFirst = sanitizePlainText(payload.firstName);
  const cleanLast = sanitizePlainText(payload.lastName || "");
  const clientName = `${cleanFirst} ${cleanLast}`.trim();
  const cleanCompany = sanitizePlainText(payload.company || "");
  const cleanService = sanitizePlainText(payload.service || "General Scoping");
  const cleanBudget = sanitizePlainText(payload.budget || "Unspecified");
  const cleanMessage = sanitizePlainText(payload.message);

  const deliveryChannels: string[] = ["local_audit_ledger"];
  let downstreamDelivered = false;

  // 1. Optional Resend Transactional Email Adapter
  if (env.resendApiKey) {
    try {
      const res = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Axiom Studio Engine <onboarding@resend.dev>",
          to: [env.contactNotificationEmail],
          reply_to: payload.email,
          subject: `[Axiom Studio Scoping] ${cleanService} — ${clientName}`,
          text: [
            `Inquiry ID: ${id}`,
            `Client: ${clientName} (${payload.email})`,
            `Company: ${cleanCompany || "N/A"}`,
            `Service Pillar: ${cleanService}`,
            `Budget Tier: ${cleanBudget}`,
            `Source: ${payload.source}`,
            "",
            "Requirements:",
            cleanMessage,
          ].join("\n"),
        }),
      });
      if (res.ok) {
        downstreamDelivered = true;
        deliveryChannels.push("resend_email");
      }
    } catch (err) {
      console.error("[DELIVERY] Resend adapter error:", err);
    }
  }

  // 2. Optional Webhook Adapter (Slack / Linear / CRM)
  if (env.contactWebhookUrl) {
    try {
      const res = await fetchWithTimeout(env.contactWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          receivedAt,
          brand: "Axiom Studio",
          clientName,
          email: payload.email,
          company: cleanCompany,
          service: cleanService,
          budget: cleanBudget,
          message: cleanMessage,
        }),
      });
      if (res.ok) {
        downstreamDelivered = true;
        deliveryChannels.push("webhook");
      }
    } catch (err) {
      console.error("[DELIVERY] Webhook adapter error:", err);
    }
  }

  // 3. Optional Supabase REST Persistence Adapter
  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    try {
      const res = await fetchWithTimeout(
        `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/contact_inquiries`,
        {
          method: "POST",
          headers: {
            apikey: env.supabaseServiceRoleKey,
            Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            inquiry_id: id,
            client_name: clientName,
            email: payload.email,
            company: cleanCompany,
            service: cleanService,
            budget: cleanBudget,
            message: cleanMessage,
            received_at: receivedAt,
          }),
        }
      );
      if (res.ok) {
        downstreamDelivered = true;
        deliveryChannels.push("supabase_postgres");
      }
    } catch (err) {
      console.error("[DELIVERY] Supabase adapter error:", err);
    }
  }

  const record: StoredInquiry = {
    id,
    receivedAt,
    clientName,
    email: payload.email,
    company: cleanCompany,
    service: cleanService,
    budget: cleanBudget,
    source: payload.source || "website",
    messageLength: cleanMessage.length,
    messagePreview: cleanMessage.slice(0, 140),
    downstreamDelivered,
    deliveryChannels,
  };

  // Persist to local append-only audit ledger (gitignored)
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(
      INQUIRIES_FILE,
      JSON.stringify({ ...record, message: cleanMessage }) + "\n",
      "utf8"
    );
  } catch (err) {
    console.warn("[AUDIT LEDGER] Non-fatal write warning:", err);
  }

  inquiryCountSession += 1;

  // Structured non-PII server log per PRD FR-API-05
  console.log(
    JSON.stringify({
      event: "INQUIRY_LOGGED",
      id,
      receivedAt,
      service: cleanService,
      budget: cleanBudget,
      messageLength: cleanMessage.length,
      deliveryChannels,
    })
  );

  return record;
}

export function getInquiryMetrics() {
  return {
    sessionInquiriesLogged: inquiryCountSession,
    configuredAdapters: {
      localAuditLedger: true,
      resendEmail: Boolean(env.resendApiKey),
      webhook: Boolean(env.contactWebhookUrl),
      supabasePostgres: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
    },
  };
}
