# Assistant project-brief pipeline

Date: 2026-11-14 · Branch: `arena/10a26884-axioms-labs`

## Product behaviour

1. The assistant collects project details conversationally (business, wanted
   service, requirements, timeline, optional budget, contact name + email).
2. Every chat reply carries a structured brief draft (`brief` in the response
   payload). The widget stores it and re-sends it on every turn, so details
   stay remembered even after older messages leave the 12-message transcript
   window — the brief object, not the transcript, is the memory.
3. Once the draft is substantive, the widget shows an **editable brief card**.
   The visitor can correct any field; nothing is submitted until they press
   **Confirm & submit**.
4. Submission goes to `POST /api/assistant/brief` (origin-guarded, 6/min
   rate-limited, zod-validated; budget optional).
5. The backend stores the confirmed brief in Supabase Postgres
   (`contact_inquiries`, `source = 'assistant_brief'`, full payload in
   `brief_json`) and then delivers it through the existing contact pipeline
   adapters (Resend email to the team, optional webhook).
6. Success is reported to the visitor **only** after the Postgres row is
   confirmed AND the email adapter accepted the message. Anything less returns
   a typed failure (`storage_unconfigured`, `storage_failed`,
   `delivery_failed`) and the widget offers a retry.

## Idempotency & retries

- The widget issues one UUID per chat session (`sessionStorage`) and sends it
  as `idempotencyKey`.
- `contact_inquiries.idempotency_key` has a partial unique index
  (migration `add_brief_idempotency_to_contact_inquiries`), so double submits
  and network retries can never create a second row.
- A row that stored but failed delivery is **resumed** on the next attempt
  with the same key: delivery retries, the row updates to
  `email_delivered = true`, no duplicate email or row.
- An already-delivered key answers `already_delivered` without touching
  storage or email again.

## Configuration required from the owner

- `SUPABASE_SERVICE_ROLE_KEY` (sensitive, production) — added 2026-11-14.
- Resend sender domain for `axiomslab.com` verified — assumed from the live
  contact pipeline; the first real brief submission confirms it.

## Tests

`backend/test/brief.cjs` (store-then-deliver ordering, duplicate suppression,
resume-after-failure, validation) and `backend/test/brief-storage.cjs`
(fail-closed when storage is unconfigured) run in CI alongside the assistant
regression suite.
