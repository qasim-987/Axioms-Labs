import { enqueueInquiry } from "./outbox.service";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env";
import { ContactPayload } from "../schemas/contact.schema";
import { sanitizePlainText, sanitizeSingleLine } from "./antiSpam.service";

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

const DATA_DIR = env.inquiryDataDir || path.resolve(process.cwd(), "data");
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
  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    const saved = await enqueueInquiry(payload);
    return {
      ...saved, clientName: `${payload.firstName} ${payload.lastName}`.trim(), email: payload.email,
      company: payload.company, service: payload.service, budget: payload.budget, source: payload.source,
      messageLength: payload.message.length, messagePreview: "", downstreamDelivered: false,
      deliveryChannels: ["supabase_outbox"],
    };
  }
  const id = `axs_${crypto.randomUUID().slice(0, 12)}`;
  const receivedAt = new Date().toISOString();
  // Single-line fields are interpolated into the email subject and into one-line
  // ledger/webhook/CRM fields, so they lose every line break. `message` keeps its
  // paragraphs: sanitizePlainText normalises CRLF to LF but preserves real line breaks.
  const cleanFirst = sanitizeSingleLine(payload.firstName);
  const cleanLast = sanitizeSingleLine(payload.lastName || "");
  const clientName = `${cleanFirst} ${cleanLast}`.trim();
  const cleanCompany = sanitizeSingleLine(payload.company || "");
  const cleanService = sanitizeSingleLine(payload.service || "General Scoping");
  const cleanBudget = sanitizeSingleLine(payload.budget || "Unspecified");
  const cleanSource = sanitizeSingleLine(payload.source || "website");
  const cleanMessage = sanitizePlainText(payload.message);

  const deliveryChannels: string[] = [];
  let downstreamDelivered = false;

  // 1. Optional Resend Transactional Email Adapter
  if (env.resendApiKey && env.contactFromEmail) {
    try {
      const res = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.contactFromEmail,
          to: [env.contactNotificationEmail],
          reply_to: payload.email,
          subject: `[Axiom Studio Scoping] ${cleanService} — ${clientName}`,
          text: [
            `Inquiry ID: ${id}`,
            `Client: ${clientName} (${payload.email})`,
            `Company: ${cleanCompany || "N/A"}`,
            `Service Pillar: ${cleanService}`,
            `Budget Tier: ${cleanBudget}`,
            `Source: ${cleanSource}`,
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

  const record: StoredInquiry = {
    id,
    receivedAt,
    clientName,
    email: payload.email,
    company: cleanCompany,
    service: cleanService,
    budget: cleanBudget,
    source: cleanSource,
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
      { encoding: "utf8", mode: 0o600 }
    );
    deliveryChannels.push("local_audit_ledger");
  } catch (err) {
    console.warn("[AUDIT LEDGER] Non-fatal write warning:", err);
  }

  // Local storage alone is not durable on ephemeral production hosts.
  if (!downstreamDelivered && (env.nodeEnv === "production" || !deliveryChannels.includes("local_audit_ledger"))) {
    throw new Error("No external inquiry channel accepted the submission");
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
