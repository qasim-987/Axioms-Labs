import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { handleWebhookPayload, verifyWebhookSignature } from "../services/whatsapp.service";

/**
 * WhatsApp Cloud API webhook.
 *  GET  = Meta subscription handshake (verify token echo).
 *  POST = signed message events; acked fast, processed idempotently.
 * Mounted with express.raw() in app.ts so the exact bytes Meta signed are
 * available for HMAC verification.
 */
export const whatsappRouter = Router();

whatsappRouter.get("/whatsapp/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (
    mode === "subscribe" &&
    env.whatsappVerifyToken &&
    token === env.whatsappVerifyToken &&
    typeof challenge === "string"
  ) {
    res.status(200).type("text/plain").send(challenge);
    return;
  }
  res.status(403).json({ success: false, code: "verify_failed" });
});

whatsappRouter.post("/whatsapp/webhook", async (req: Request, res: Response) => {
  if (!env.whatsappAppSecret) {
    // Not configured yet: ack so Meta does not retry-storm, but log loudly.
    console.error(JSON.stringify({ event: "WHATSAPP_UNCONFIGURED" }));
    res.status(200).json({ success: true, unconfigured: true });
    return;
  }
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
  const signature = req.headers["x-hub-signature-256"];
  if (!verifyWebhookSignature(raw, typeof signature === "string" ? signature : undefined)) {
    res.status(401).json({ success: false, code: "bad_signature" });
    return;
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    res.status(400).json({ success: false, code: "bad_json" });
    return;
  }
  try {
    const outcome = await handleWebhookPayload(payload);
    console.log(JSON.stringify({ event: "WHATSAPP_WEBHOOK_PROCESSED", ...outcome }));
    res.status(200).json({ success: true, ...outcome });
  } catch (err) {
    // Ack anyway: processing is idempotent, Meta retries would only duplicate work.
    console.error(JSON.stringify({ event: "WHATSAPP_WEBHOOK_ERROR" }));
    res.status(200).json({ success: true, error: true });
  }
});
