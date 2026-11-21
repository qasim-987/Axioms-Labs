# WhatsApp Cloud API Pipeline

Phase 1 (live): webhook + signature validation + idempotent processing + one
fixed acknowledgement reply. Phase 2 (next): shared assistant knowledge,
requirement gathering, inquiry submission, staff reply/pause/resume UI.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/whatsapp/webhook` | Meta subscription handshake (`hub.challenge` echo) |
| POST | `/api/whatsapp/webhook` | Signed message events; `X-Hub-Signature-256` verified against the raw body before parsing |

The POST path is mounted with `express.raw()` **before** the JSON parser so
the exact bytes Meta signed are available for HMAC verification.

## Reliability rules

- **Prompt ack:** the webhook always returns 200 quickly; Meta retries on
  timeout, and retries are harmless because processing is idempotent.
- **Duplicate handling:** `whatsapp_messages.wa_message_id` is UNIQUE — a
  redelivered event inserts nothing and sends nothing.
- **Delivery receipts ignored:** `value.statuses` events are never read for
  reply generation (only `value.messages`).
- **Per-sender history:** one `whatsapp_threads` row per sender phone;
  `automation_enabled = false` pauses auto-replies for that sender (staff
  toggle lands in phase 2).
- **Failures:** a Graph API send failure marks the inbound row `failed`,
  logs `WHATSAPP_SEND_FAILED`, and still acks 200 (Meta is not at fault).
- Tables have RLS enabled with no policies; all access is service-role via
  the backend, matching the staff dashboard pattern.

## Environment variables (backend Vercel project, Sensitive type)

| Name | Value |
| --- | --- |
| `WHATSAPP_VERIFY_TOKEN` | your own random string (`openssl rand -hex 16`); same value in Meta webhook config |
| `WHATSAPP_APP_SECRET` | Meta App Settings → Basic → App Secret |
| `WHATSAPP_ACCESS_TOKEN` | System User token with `whatsapp_business_messaging` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Manager → phone numbers |
| `WHATSAPP_API_VERSION` | pinned Graph version (default `v25.0`) |

## Meta setup checklist (owner)

1. developers.facebook.com → My Apps → Create App → **Business** → add
   product **WhatsApp**.
2. API Setup: note the free **test number**, Phone Number ID, WABA ID.
3. Business Settings → System Users → token with
   `whatsapp_business_messaging` (+ `whatsapp_business_management` later).
4. Backend Vercel project: add the five env vars above, redeploy.
5. WhatsApp → Configuration → Webhook:
   Callback URL `https://api.axiomslab.com/api/whatsapp/webhook`,
   Verify token = the same string as `WHATSAPP_VERIFY_TOKEN` → **Verify and
   save** (this GETs the handshake; it only succeeds after step 4).
6. Subscribe field: `messages`.
7. Add your own number under API Setup → "To" numbers (OTP on your phone),
   then message the test number — the fixed reply should arrive.

While the app is **unpublished**, only test-number traffic and dashboard
test events flow (Meta banner says the same). Publish later for production
numbers together with business verification.

## Phase 1 fixed reply

> Hi! Thanks for messaging Axioms Lab - we've received your message and our
> team will reply here shortly. Want to skip the queue? Start a project brief
> at www.axiomslab.com and our assistant will capture the details.

## Tests

`backend/test/whatsapp.cjs` (7): handshake echo + wrong token 403; unsigned
and tampered payloads 401; signed text → exactly one fixed reply; statuses
ignored; duplicate wamid → no second reply; paused thread → stored, no send;
Graph failure → acked + marked failed.
