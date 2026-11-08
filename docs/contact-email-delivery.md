# Contact email delivery

The owner confirmed that info@axiomslab.com is an existing working mailbox and
that axiomslab.com is verified in Resend. Domain verification has not been
independently checked through the provider API.

Backend Vercel project: axioms-labs (not the frontend axiomslab-web).
Production settings prepared through the Vercel connector:
- CONTACT_NOTIFICATION_EMAIL=info@axiomslab.com
- RESEND_API_KEY: secret configured by the owner; value not retrieved.

Code uses CONTACT_FROM_EMAIL when set, otherwise
`Axioms Lab <info@axiomslab.com>`. The visitor's email is Reply-To, never From.
When a notification recipient is configured, a missing key, rejection, or network
failure returns HTTP 503 rather than a misleading success. Other storage adapters
still run; retries can duplicate a stored inquiry. No delivery retry queue is added.
Provider acceptance is not proof of inbox placement. Spam traps retain silent 200.

Run `npm run test:email --prefix backend` for offline integration tests using
mocked provider responses. These tests never send real email.

Release still required: merge/deploy these changes with fresh production settings,
then submit one clearly marked test inquiry and confirm the message arrives in the
owner's inbox (including checking spam). No live delivery test has been sent yet.
Do not change existing mailbox MX records to enable outbound notifications.
