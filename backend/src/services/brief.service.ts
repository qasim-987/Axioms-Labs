import crypto from "node:crypto";
import { env } from "../config/env";
import type { ProjectBriefSubmission } from "../schemas/brief.schema";
import { sanitizePlainText, sanitizeSingleLine } from "./antiSpam.service";

/**
 * Confirmed project-brief pipeline: durable storage first, then delivery,
 * with idempotent retries.
 *
 *  - Supabase Postgres is the permanent record. `idempotency_key` carries a
 *    partial unique index, so a visitor retry (or a double-tapped confirm
 *    button) can never create a second row for the same brief.
 *  - Delivery reuses the contact pipeline's adapters (Resend email, optional
 *    webhook). A row that stored but failed delivery is resumed on the next
 *    submission attempt with the same key instead of being duplicated.
 *  - Success is reported ONLY when the row is confirmed in Postgres AND the
 *    email adapter accepted the message; anything less returns a typed
 *    failure so the widget never shows a false "thank you".
 */

export type BriefSubmitStatus =
  | "delivered"
  | "already_delivered"
  | "stored_not_delivered"
  | "storage_failed";

export interface BriefSubmitResult {
  status: BriefSubmitStatus;
  inquiryId: string;
  deliveryChannels: string[];
}

interface StoredBriefRow {
  inquiry_id: string;
  email_delivered: boolean;
}

const REST_TIMEOUT_MS = 6000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function restBase(): string {
  return `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/contact_inquiries`;
}

function restHeaders(): Record<string, string> {
  return {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function findByKey(idempotencyKey: string): Promise<StoredBriefRow | null> {
  const res = await fetchWithTimeout(
    `${restBase()}?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=inquiry_id,email_delivered`,
    { headers: restHeaders() }
  );
  if (!res.ok) return null;
  const rows = (await res.json().catch(() => [])) as StoredBriefRow[];
  return rows[0] || null;
}

export function renderBriefText(b: ProjectBriefSubmission): string {
  return [
    `Business: ${b.business}`,
    `Requested service: ${b.service}`,
    `Timeline: ${b.timeline}`,
    `Budget: ${b.budget?.trim() ? b.budget.trim() : "Not specified (optional)"}`,
    `Contact: ${b.contactName} <${b.email}>`,
    "",
    "Requirements:",
    b.requirements,
  ].join("\n");
}

async function sendBriefEmail(
  brief: ProjectBriefSubmission,
  inquiryId: string
): Promise<boolean> {
  if (!env.resendApiKey || !env.contactNotificationEmail) return false;
  const text = sanitizePlainText(renderBriefText(brief));
  const body = JSON.stringify({
    from: env.contactFromEmail,
    to: [env.contactNotificationEmail],
    reply_to: brief.email,
    subject: `[Axioms Lab Project Brief] ${sanitizeSingleLine(brief.business)} — ${sanitizeSingleLine(brief.contactName)}`,
    text: [`Inquiry ID: ${inquiryId}`, `Source: assistant_brief (confirmed in chat)`, "", text].join("\n"),
  });
  // One immediate retry: transient Resend blips should not cost us a lead.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body,
      });
      if (res.ok) return true;
      // Do not log response bodies: they may contain submitted personal data.
      console.error(
        JSON.stringify({
          event: "BRIEF_EMAIL_REJECTED",
          inquiryId,
          status: res.status,
          attempt: attempt + 1,
        })
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          event: "BRIEF_EMAIL_TRANSPORT_ERROR",
          inquiryId,
          attempt: attempt + 1,
        })
      );
    }
  }
  return false;
}

async function notifyWebhook(brief: ProjectBriefSubmission, inquiryId: string): Promise<boolean> {
  if (!env.contactWebhookUrl) return false;
  try {
    const res = await fetchWithTimeout(env.contactWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inquiryId, source: "assistant_brief", brief }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function markDelivered(idempotencyKey: string, inquiryId: string): Promise<void> {
  try {
    await fetchWithTimeout(
      `${restBase()}?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`,
      {
        method: "PATCH",
        headers: { ...restHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({
          email_delivered: true,
          delivered_at: new Date().toISOString(),
        }),
      }
    );
  } catch (err) {
    console.error(JSON.stringify({ event: "BRIEF_DELIVERY_FLAG_FAILED", inquiryId }));
  }
}

async function insertBriefRow(
  brief: ProjectBriefSubmission,
  inquiryId: string
): Promise<boolean> {
  const receivedAt = new Date().toISOString();
  const res = await fetchWithTimeout(restBase(), {
    method: "POST",
    headers: {
      ...restHeaders(),
      // A concurrent duplicate (double submit) resolves to the existing row
      // instead of throwing a unique-violation.
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      inquiry_id: inquiryId,
      idempotency_key: brief.idempotencyKey,
      client_name: sanitizeSingleLine(brief.contactName),
      email: brief.email,
      company: sanitizeSingleLine(brief.business),
      service: sanitizeSingleLine(brief.service),
      budget: sanitizeSingleLine(brief.budget || "") || "Unspecified",
      message: sanitizePlainText(renderBriefText(brief)),
      source: "assistant_brief",
      brief_json: brief,
      email_delivered: false,
      received_at: receivedAt,
    }),
  });
  return res.ok || res.status === 201;
}

export async function submitProjectBrief(
  brief: ProjectBriefSubmission
): Promise<BriefSubmitResult> {
  const channels: string[] = [];

  const existing = await findByKey(brief.idempotencyKey);
  if (existing) {
    if (existing.email_delivered) {
      // Retry of an already-finished submission: answer success, touch nothing.
      return { status: "already_delivered", inquiryId: existing.inquiry_id, deliveryChannels: ["resume_skipped"] };
    }
    // Stored earlier but delivery failed: resume delivery, never re-insert.
    const emailed = await sendBriefEmail(brief, existing.inquiry_id);
    if (emailed) channels.push("resend_email");
    if (await notifyWebhook(brief, existing.inquiry_id)) channels.push("webhook");
    if (emailed) {
      await markDelivered(brief.idempotencyKey, existing.inquiry_id);
      return { status: "delivered", inquiryId: existing.inquiry_id, deliveryChannels: channels };
    }
    return { status: "stored_not_delivered", inquiryId: existing.inquiry_id, deliveryChannels: channels };
  }

  const inquiryId = `axb_${crypto.randomUUID().slice(0, 12)}`;
  let stored = false;
  try {
    stored = await insertBriefRow(brief, inquiryId);
  } catch (err) {
    stored = false;
  }
  if (!stored) {
    console.error(JSON.stringify({ event: "BRIEF_STORAGE_FAILED", inquiryId }));
    return { status: "storage_failed", inquiryId, deliveryChannels: channels };
  }
  // Confirm the row really exists (guards against silent adapter mismatches).
  const confirmed = await findByKey(brief.idempotencyKey);
  if (!confirmed) {
    console.error(JSON.stringify({ event: "BRIEF_STORAGE_UNCONFIRMED", inquiryId }));
    return { status: "storage_failed", inquiryId, deliveryChannels: channels };
  }

  const emailed = await sendBriefEmail(brief, confirmed.inquiry_id);
  if (emailed) channels.push("resend_email");
  if (await notifyWebhook(brief, confirmed.inquiry_id)) channels.push("webhook");
  if (emailed) {
    await markDelivered(brief.idempotencyKey, confirmed.inquiry_id);
    console.log(
      JSON.stringify({
        event: "BRIEF_SUBMITTED",
        inquiryId: confirmed.inquiry_id,
        deliveryChannels: channels,
      })
    );
    return { status: "delivered", inquiryId: confirmed.inquiry_id, deliveryChannels: channels };
  }
  console.error(JSON.stringify({ event: "BRIEF_DELIVERY_FAILED", inquiryId: confirmed.inquiry_id }));
  return { status: "stored_not_delivered", inquiryId: confirmed.inquiry_id, deliveryChannels: channels };
}
