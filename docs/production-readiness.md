# Production readiness — 2026-10-30

Scope: technical hardening and dependency/browser-QA follow-up. Current design, motion, pricing and brand content preserved. Changes are local to the Arena branch; not merged or deployed. Checked boxes describe code and local verification, not live certification.

## Completed in this pass
- [x] Validate contact payload before evaluating honeypots, preventing malformed field types from causing an internal error.
- [x] In production, reject submissions with HTTP 503 when no external email/webhook/database adapter accepts them. A local ledger alone no longer implies success.
- [x] Remove the unconfirmed 24-hour response promise from the API response.
- [x] Make verified email sender configurable via CONTACT_FROM_EMAIL; no test sender fallback.
- [x] Configure local ledger location via INQUIRY_DATA_DIR and create new ledger files with owner-only permissions. Existing files need their permissions checked separately.
- [x] Use Express's proxy-aware req.ip; trust no proxies by default. Accept explicitly configured proxy IPs/CIDRs only.
- [x] Default CORS to the brand origin; production wildcard does not grant browser cross-origin access. CORS is not authentication or bot protection.
- [x] Return JSON errors for invalid JSON and oversized request bodies.
- [x] Remove adapter configuration and inquiry counts from public contact status.
- [x] Add a 25-second contact-client timeout, safe handling of non-JSON proxy failures, and explicit success validation.
- [x] Correct frontend CI typecheck to avoid depending on uninstalled backend dependencies.
- [x] Add API regression tests to backend CI: invalid email, malformed honeypot, honeypot trap, unavailable delivery, accepted/rejected mocked webhook, CORS, malformed JSON, body limit, status privacy, forwarded-IP rate-limit bypass.
- [x] Run production dependency audits and record outstanding findings below.
- [x] Frontend/backend typecheck, production build and diff whitespace check pass.
- [x] API suite passes: 10 subtests plus parent test (11 TAP passes). Mocked external delivery is not real provider verification.
- [x] Lint passes with five existing landing hook warnings, not resolved by this pass.

## Launch blockers / high priority
- [x] Remediate the previously reported production dependency advisories: Next.js/eslint-config-next 15.5.28, backend Zod 4.6.7 (schema API migrated), patched PostCSS through a documented override to the direct dependency. Both npm audit --omit=dev runs report zero vulnerabilities as of this pass. This is not a guarantee against future advisories.
- [ ] Deploy/verify reachable backend and set BACKEND_INTERNAL_URL on frontend; rebuild after rewrite-target changes.
- [ ] Confirm final domain, email, pricing, location/support claims and project evidence.
- [ ] Configure verified sender, recipient, email credentials and/or external database/webhook. Verify delivery from every live form.
- [ ] Add durable full-payload storage/outbox, notification retries with idempotency, and failed-delivery alerting. Current synchronous adapters are not an outbox. An accepted email/webhook does not guarantee database persistence.
- [ ] Configure actual hosting proxy CIDRs. An incorrect trust configuration can group visitors into one rate-limit bucket; never trust all proxies to work around this.
- [ ] Replace process-local rate limiting with a shared store if scaling across workers/instances; protect direct backend access appropriately.
- [ ] Configure persistent ledger volume, retention, restrictive directory permissions and backups; test restores. If ledger writes fail but an external adapter accepts, request can still succeed.
- [ ] Publish reviewed Privacy Policy and legal/service terms; agree data retention/deletion procedures.
- [ ] Test repeated submission and partial-delivery scenarios; retries by a visitor can currently create duplicates.

## Remaining QA and improvements
- [ ] Real iOS Safari/Android, 360px, tablet, desktop, large text and 200% zoom checks.
- [ ] Keyboard/screen-reader/contrast audit and accessible field-error verification.
- [x] Fix SSR/client reduced-motion DOM mismatches in SplitTextReveal and ScrollProgressBar using the existing hydration-safe preference hook. Normal and reduced-motion 360px fallback/form browser scenarios have no page runtime errors. Broader WebGL/desktop and physical-device coverage remains pending.
- [ ] No-WebGL, slow network, tab visibility and 20-route-cycle memory checks.
- [ ] Production Lighthouse/Core Web Vitals measurement and targeted asset/particle/font optimization; no performance score claimed.
- [ ] Align canonical domain, structured data, robots, sitemap and contact email.
- [ ] Verify unique metadata/H1s, sharing assets, favicon, redirects and broken links.
- [x] Remove artificial current-date sitemap modification dates. Dates are omitted until authoritative content-update dates are available.
- [x] Add scripts/check-production-smoke.cjs: all six forms at 360px in normal/reduced motion with WebGL disabled; mocked HTML 503, retained message, successful retry and no horizontal overflow. All 12 scenarios pass on the final build.
- [ ] Extend browser coverage to timeout, validation accessibility, real delivery, desktop, network throttling and route lifecycle tests.
- [ ] Resolve five pre-existing hook lint warnings with lifecycle regression testing.
- [ ] Add uptime/error/delivery monitoring and privacy-conscious conversion analytics.
- [ ] Verify Search Console and submit sitemap.
- [ ] Improve approved service positioning, project evidence, FAQs and mobile path to Work without redesigning the site.
- [ ] Deploy approved changes, run live smoke tests and verify rollback.

## Safe deployment/runbook
1. Run npm ci and npm --prefix backend ci.
2. Run npm run typecheck, npm run lint, npm --prefix backend test, npm run build and git diff --check.
3. Configure backend NODE_ENV=production, CORS_ALLOWED_ORIGINS (exact final origins), TRUST_PROXY (provider IPs/CIDRs), CONTACT_FROM_EMAIL (verified), CONTACT_NOTIFICATION_EMAIL and required delivery credentials. Keep all secrets backend-only.
4. Prefer durable database persistence; configure SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY and provision contact_inquiries according to backend/src/services/delivery.service.ts. Enforce private access/RLS and retention; never expose service role credentials.
5. If used, mount INQUIRY_DATA_DIR on persistent private storage. Protect logs and ledger as personal data.
6. Set frontend BACKEND_INTERNAL_URL to the deployed API origin and rebuild. Browser code must continue using relative /api paths.
7. Verify /api/health and manually send a uniquely labeled test from homepage, contact and each service form. Verify the actual record and inbox; remove test personal data afterward.
8. Check invalid input, 503, 429, slow network and retry behavior. Do not run load/spam tests against production without planning.
9. Record known-good frontend and backend versions before release. Roll both back together if request/response contracts change; retest delivery after rollback. Do not roll back persisted data blindly.
10. Configure uptime/delivery alerts and a named owner before promotion. Automatic deployment remains unchanged.

## Follow-up verification and compatibility notes
- App Router slug params and metadata handlers migrated to awaited Promise params for Next.js 15 compatibility. All 26 static pages build.
- React 18 retained; no visual redesign or new application dependency was introduced. Optional browser tooling is installed outside the application.
- PostCSS override references `$postcss`, so transitive and direct versions resolve to the same patched range. Recheck compatibility/audits with future dependency upgrades.
- Final typecheck, lint (five existing warnings), backend tests, production build, browser smoke and whitespace checks pass. No production deployment performed.
- Browser QA command in this sandbox: `LD_LIBRARY_PATH=/tmp/chromium-libs/lib NODE_PATH=/home/user/browser-tools/node_modules node scripts/check-production-smoke.cjs`. On another machine install optional playwright/@sparticuz/chromium and its OS libraries; Chromium binaries here are ephemeral. Set BASE_URL only to a controlled QA site. Contact requests are intercepted; inbox/database delivery is not exercised.
- Physical-device, Lighthouse, memory leak, slow-network and full WCAG certification are not claimed. Durable outbox, shared limiter, monitoring and live service configuration still require implementation/verification as listed above.

## Approved continuation — durable outbox implementation
- [x] Add versioned database migration `backend/migrations/001_inquiry_outbox.sql`: private/RLS-enabled inquiry and outbox tables, atomic enqueue, unique dedupe key, service-role-only functions.
- [x] Add database-backed submission path. With Supabase configured, requests succeed only after the enqueue RPC accepts the inquiry; storage failure returns an error without pretending to send email.
- [x] Add one-shot worker `npm --prefix backend run worker:outbox` (after build): per-channel notifications, 10-second provider timeout, retry backoff, five-attempt ceiling, expiring job leases and stale-worker completion protection.
- [x] Add stable per-job provider idempotency keys. Webhook receivers must honor them; this is at-least-once delivery, not a universal exactly-once guarantee. Resend dedupe retention is provider-limited.
- [x] Add notification failure/exhaustion structured log events without inquiry contents. External alert routing is not configured yet.
- [x] Local PostgreSQL-WASM migration test passes: schema application, atomic enqueue, dedupe, job leasing, retry, stale token guard, crashed final-attempt recovery and denied anonymous access. Script: `NODE_PATH=/home/user/browser-tools/node_modules node scripts/check-outbox-sql.cjs` (optional `@electric-sql/pglite` outside app).
- [x] Mocked enqueue/worker contract tests pass alongside API regressions (12 TAP passes including parent). Typecheck, lint (existing warnings), build and whitespace check pass.
- [x] User confirmed “Axiomic Studio” as the target. Applied create_private_inquiry_outbox migration to project yubspfjyaxyuepcwlobh. Verified both tables have RLS enabled, anon/authenticated cannot SELECT, and only service_role (not anon) can execute the three RPCs.
- [x] Apply private inquiry/outbox migration to the confirmed project.
- [ ] Configure credentials backend-side and schedule the worker every minute. No scheduler/worker deployment has been activated.
- [ ] Verify provider delivery, permissions and crash/retry behavior on the real database. Optional SQL test is not Supabase-hosted integration certification.
- [ ] Wire log alerts and monitor pending age/failed job count (including crashed exhausted jobs). Set retention/deletion procedures and verify backups.

### Operational limitations
- Duplicate suppression currently covers identical normalized payloads in the same fixed ten-minute bucket; submissions across a bucket boundary may duplicate. It is not permanent identity-based deduplication.
- Jobs are created for configured channels at submission time. Submissions accepted with no notification channel remain stored but produce no notifications; monitor this configuration and explicitly backfill when enabling a channel.
- When Supabase is not configured the previous synchronous adapters remain available; this fallback is not a durable outbox.
- Scheduler cadence and provider idempotency support are required. Keep notification providers configured consistently on API and worker hosts.
- To remove personal data, delete the inquiry according to the approved retention policy; linked jobs cascade. Service-role access must remain private. Do not roll back by dropping tables with live inquiries.

Live database schema is now installed with user approval; the website/backend code remains unmerged and undeployed. No real provider delivery or live inquiry insertion was performed.

## Production release — 2026-10-30
- Frontend deployed from 014b5aa85e54c33bdeb678bfbc376e676f4684cb: dpl_2DdCWo7iPw6NQzw3EJQ2PoRDfmGC, READY/PROMOTED.
- Backend deployed from 7537077446dffdc092a9cbc8d6a9cbe0c3628087: dpl_5qJVDKVavrqVEbDU2S9GNHjD4Rqy, READY/PROMOTED. Initial auto-detected Express deployment failed on invocation; explicit @vercel/node handler fixed live startup. Ledger path no longer depends on __dirname.
- Backend Supabase URL and sensitive service-role environment variable configured for production only. No secrets committed or exposed to frontend.
- Live homepage fetched successfully. Frontend /api/health proxy returns operational and database adapter configured.
- Real contact POST/database persistence still needs end-to-end verification. Verified email sender/provider credentials and worker schedule are NOT configured; stored inquiries do not currently trigger inbox notifications. Do not claim complete production readiness.
- Deployed from the active Arena branch; main has not been merged. Automatic Git deployments remain disabled.
