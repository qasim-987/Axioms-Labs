import crypto from "node:crypto";
import { env } from "../config/env";

/**
 * WhatsApp Cloud API integration (phase 1: webhook + one fixed reply).
 *
 * Security & reliability contract:
 *  - GET  webhook: Meta handshake (hub.mode/hub.verify_token/hub.challenge).
 *  - POST webhook: X-Hub-Signature-256 (HMAC-SHA256 of the RAW body with the
 *    app secret) verified with a timing-safe compare before any parsing.
 *  - Delivery receipts (`value.statuses`) are ignored for reply generation.
 *  - Duplicate deliveries are rejected by the UNIQUE wa_message_id column, so
 *    Meta retries can never produce a second reply.
 *  - Every sender gets their own thread row; automation can be paused per
 *    sender (staff controls land in phase 2).
 */

export const WHATSAPP_FIXED_REPLY =
  "Hi! Thanks for messaging Axioms Lab - we've received your message and our team will reply here shortly. Want to skip the queue? Start a project brief at www.axiomslab.com and our assistant will capture the details.";

function restBase(): string {
  return `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1`;
}

function restHeaders(): Record<string, string> {
  return {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

/** Timing-safe verification of Meta's X-Hub-Signature-256 header. */
export function verifyWebhookSignature(rawBody: Buffer, header: string | undefined): boolean {
  if (!env.whatsappAppSecret || !header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", env.whatsappAppSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface WebhookOutcome {
  received: number;
  duplicates: number;
  replied: number;
  paused: number;
  failed: number;
}

interface WaMessage {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
}

async function upsertThread(sender: string): Promise<{ automation_enabled: boolean } | null> {
  const res = await fetch(`${restBase()}/whatsapp_threads`, {
    method: "POST",
    headers: { ...restHeaders(), Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({ sender_phone: sender, last_user_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!res.ok) return null;
  const rows = (await res.json().catch(() => [])) as { automation_enabled: boolean }[];
  return rows[0] ?? { automation_enabled: true };
}

async function insertMessage(row: {
  sender_phone: string;
  wa_message_id: string;
  role: "user" | "assistant" | "staff";
  body: string;
  status: "pending" | "done" | "failed";
}): Promise<"inserted" | "duplicate" | "error"> {
  const res = await fetch(`${restBase()}/whatsapp_messages`, {
    method: "POST",
    headers: { ...restHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (res.status === 201 || res.status === 200) return "inserted";
  if (res.status === 409) return "duplicate";
  return "error";
}

async function patchMessageStatus(waMessageId: string, status: "done" | "failed"): Promise<void> {
  await fetch(
    `${restBase()}/whatsapp_messages?wa_message_id=eq.${encodeURIComponent(waMessageId)}&role=eq.user`,
    {
      method: "PATCH",
      headers: { ...restHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
    }
  );
}

/** Send a plain text message through the Cloud API. */
export async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) return false;
  const url = `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body, preview_url: false },
      }),
    });
    if (!res.ok) {
      console.error(JSON.stringify({ event: "WHATSAPP_SEND_FAILED", status: res.status }));
      return false;
    }
    return true;
  } catch (err) {
    console.error(JSON.stringify({ event: "WHATSAPP_SEND_FAILED", error: "transport" }));
    return false;
  }
}

/**
 * Process a signature-verified webhook payload. Always safe to call twice
 * for the same payload: the unique message id makes the second pass a no-op.
 */
export async function handleWebhookPayload(payload: unknown): Promise<WebhookOutcome> {
  const outcome: WebhookOutcome = { received: 0, duplicates: 0, replied: 0, paused: 0, failed: 0 };
  const root = payload as {
    entry?: { changes?: { value?: { messages?: WaMessage[]; statuses?: unknown[] } }[] }[];
  };
  // `statuses` (delivery/read receipts) are deliberately never read here.
  for (const entry of root.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        const sender = msg.from || "";
        const wamid = msg.id || "";
        if (!sender || !wamid) continue;
        if (msg.type !== "text") continue; // phase 1: text only
        outcome.received += 1;

        const thread = await upsertThread(sender);
        if (!thread) {
          outcome.failed += 1;
          continue;
        }
        const stored = await insertMessage({
          sender_phone: sender,
          wa_message_id: wamid,
          role: "user",
          body: msg.text?.body || "",
          status: "pending",
        });
        if (stored === "duplicate") {
          outcome.duplicates += 1;
          continue;
        }
        if (stored === "error") {
          outcome.failed += 1;
          continue;
        }
        if (!thread.automation_enabled) {
          outcome.paused += 1;
          await patchMessageStatus(wamid, "done");
          continue;
        }
        const sent = await sendWhatsAppText(sender, WHATSAPP_FIXED_REPLY);
        if (sent) {
          outcome.replied += 1;
          await insertMessage({
            sender_phone: sender,
            wa_message_id: `${wamid}:reply`,
            role: "assistant",
            body: WHATSAPP_FIXED_REPLY,
            status: "done",
          });
          await patchMessageStatus(wamid, "done");
        } else {
          outcome.failed += 1;
          await patchMessageStatus(wamid, "failed");
        }
      }
    }
  }
  return outcome;
}
