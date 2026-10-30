import crypto from "node:crypto";
import { env } from "../config/env";
import { ContactPayload } from "../schemas/contact.schema";
import { sanitizePlainText } from "./antiSpam.service";

export async function outboxRpc(name: string, body: object): Promise<unknown> {
  const response = await fetch(`${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: env.supabaseServiceRoleKey, Authorization: `Bearer ${env.supabaseServiceRoleKey}` },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Outbox ${name} failed (${response.status})`);
  const text = await response.text();
  return text ? JSON.parse(text) as unknown : null;
}

export async function enqueueInquiry(payload: ContactPayload): Promise<{ id: string; receivedAt: string }> {
  const record = {
    client_name: sanitizePlainText(`${payload.firstName} ${payload.lastName}`).trim(),
    email: payload.email, company: sanitizePlainText(payload.company), service: sanitizePlainText(payload.service),
    budget: payload.budget, message: sanitizePlainText(payload.message), phone: `${payload.countryCode} ${payload.phone}`.trim(), source: payload.source,
  };
  // A short dedupe window prevents double-clicks/retries across workers; excludes anti-spam timestamps.
  const content = JSON.stringify(record);
  const requestKey = crypto.createHash("sha256").update(`${Math.floor(Date.now() / 600_000)}:${content}`).digest("hex");
  const channels = [env.resendApiKey && env.contactFromEmail ? "email" : "", env.contactWebhookUrl ? "webhook" : ""].filter(Boolean);
  const result = await outboxRpc("enqueue_inquiry", { p_record: { ...record, inquiry_id: `axs_${crypto.randomUUID()}`, request_key: requestKey }, p_channels: channels });
  if (typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string" || !("receivedAt" in result) || typeof result.receivedAt !== "string") throw new Error("Invalid outbox response");
  return { id: result.id, receivedAt: result.receivedAt };
}
