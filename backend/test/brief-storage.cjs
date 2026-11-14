process.env.GROQ_API_KEY = "brief-regression-key";
process.env.RESEND_API_KEY = "resend-regression-key";
process.env.CONTACT_NOTIFICATION_EMAIL = "team@example.com";
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY intentionally absent.

const { test } = require("node:test");
const assert = require("node:assert/strict");

const realFetch = global.fetch.bind(global);

test("brief submission fails closed when permanent storage is unconfigured", async (t) => {
  t.mock.method(global, "fetch", async () => new Response("{}", { status: 200 }));
  const { createBackendApp } = require("../dist/app");
  const server = createBackendApp().listen(0, "127.0.0.1");
  t.after(() => { server.close(); server.closeAllConnections(); });
  await new Promise((resolve) => server.on("listening", resolve));

  const res = await realFetch(`http://127.0.0.1:${server.address().port}/api/assistant/brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: "91111111-2222-4333-8444-555555555555",
      business: "Bluebird Bakery",
      service: "Production website",
      requirements: "Menu pages, delivery links and a CMS the staff can edit.",
      timeline: "Before Ramadan",
      contactName: "Aisha Khan",
      email: "aisha@example.com",
    }),
  });
  const body = await res.json();
  assert.equal(res.status, 503);
  assert.equal(body.code, "storage_unconfigured");
  assert.equal(body.success, false);
});
