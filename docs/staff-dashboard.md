# Private Staff Dashboard (Confirmed Inquiries)

A small, private dashboard at `/staff` for reviewing confirmed assistant
briefs, adding follow-up notes, and moving each inquiry through
`new → contacted → under discussion → closed`.

## Security model

- **Identity:** Supabase Auth (the project's existing auth system). Staff sign
  in with email + password on `/staff`; public signup is disabled
  project-wide (`disable_signup = true`), so accounts can only be created by
  the owner in the Supabase Dashboard.
- **Authorization (backend-enforced):** every `/api/staff/*` route verifies
  the Supabase JWT server-side — signature via the project JWKS (ES256 in
  production, RS256 supported), plus `iss`, `aud`, and `exp` — and then
  checks the email against the `STAFF_EMAILS` allowlist. An empty allowlist
  denies everyone (fail closed). The frontend login gate is UX only; an
  unauthorized visitor gets `401` from the API even with the URL and a valid
  non-staff session.
- **Data access:** both `contact_inquiries` and `staff_followup_notes` have
  RLS enabled with **no** anon/authenticated policies. All reads/writes go
  through the backend with the service-role key, which never ships to the
  browser.
- **Key rotation:** if a signature check fails against the cached JWKS
  (1 h TTL), the backend force-refreshes the JWKS once and retries.

## Endpoints (all require `Authorization: Bearer <supabase jwt>`)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/staff/inquiries` | Latest 100 inquiries (summary) |
| GET | `/api/staff/inquiries/:id` | Brief, contact details, consented conversation context, notes |
| POST | `/api/staff/inquiries/:id/notes` | Add a follow-up note (`{ body }`, ≤ 2000 chars; author = verified staff email) |
| PATCH | `/api/staff/inquiries/:id` | Set status (`{ status }` ∈ new/contacted/under_discussion/closed) |

## Conversation context (visitor consent)

The widget's confirm screen has an explicit opt-in checkbox ("Include our
chat conversation with this brief…"). Only when it is ticked does the
submission carry `includeContext: true` plus the last ≤ 12 messages, and only
then does the backend store them in `contact_inquiries.conversation_context`.
No consent → the column stays `NULL`. This is covered by tests in
`backend/test/brief.cjs`.

## Storage & redeploy survival

Inquiries, notes, statuses, and consented context live in Supabase Postgres
(migration `staff_dashboard_support`), never in the app process — so they
survive redeploys of both Vercel projects. `staff_followup_notes` rows
cascade-delete with their inquiry.

## Environment variables

Backend (Vercel `axioms-lab-backend`):

- `STAFF_EMAILS` — comma-separated allowlist, e.g. `owner@axiomslab.com`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — already set
- `SUPABASE_JWKS_URL` — optional override, defaults to
  `SUPABASE_URL + /auth/v1/.well-known/jwks.json`

Frontend (Vercel web project; both values are public by design):

- `NEXT_PUBLIC_SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the project's anon/publishable key

## Staff-login setup (owner)

1. Supabase Dashboard → **Authentication → Users → Add user → Create new
   user**. Enter the staff email + password, tick **Auto Confirm User**
   (public signup stays disabled).
2. Add that email to `STAFF_EMAILS` on the backend Vercel project and
   redeploy the backend.
3. Sign in at `https://www.axiomslab.com/staff`.

## Local preview

`next.config.mjs` proxies `/sb/*` to `SUPABASE_STUB_URL` when set — a local
development bridge so the dashboard can be exercised end-to-end in the
sandbox (local ES256 signing stub). Unset in production, so the rewrite never
ships.
