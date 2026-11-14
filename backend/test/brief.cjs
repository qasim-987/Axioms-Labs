process.env.GROQ_API_KEY = "brief-regression-key";
process.env.SUPABASE_URL = "http://127.0.0.1:4399";
process.env.SUPABASE_SERVICE_ROLE_KEY = "sb-regression-key";
process.env.RESEND_API_KEY = "resend-regression-key";
process.env.CONTACT_NOTIFICATION_EMAIL = "team@example.com";

const { test } = require("node:test");
const assert = require("node:assert/strict");

// The suite mocks global.fetch for provider adapters; client calls to our own
// Express server must keep using the real fetch.
const realFetch = global.fetch.bind(global);

const BRIEF = {
  idempotencyKey: "11111111-2222-4333-8444-555555555555",
  business: "Bluebird Bakery",
  service: "Production website",
  requirements: "Menu pages, delivery links and a CMS the staff can edit.",
  timeline: "Before Ramadan",
  budget: "",
  contactName: "Aisha Khan",
  email: "aisha@example.com",
};

/** Mutable scenario store the mocked fetch adapter reads on every call. */
const scenario = {
  existingRows: [],
  insertCalls: [],
  patchCalls: [],
  resendStatus: 200,
  resendCalls: 0,
};

function resetScenario() {
  scenario.existingRows = [];
  scenario.insertCalls = [];
  scenario.patchCalls = [];
  scenario.resendStatus = 200;
  scenario.resendCalls = 0;
}

test.beforeEach(() => {
  resetScenario();
  t_mockFetch();
});

let app;
let server;
let baseUrl;

function t_mockFetch() {
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.includes("/rest/v1/contact_inquiries")) {
      const method = options.method || "GET";
      if (method === "GET") {
        return new Response(JSON.stringify(scenario.existingRows), { status: 200 });
      }
      if (method === "POST") {
        const row = JSON.parse(options.body);
        scenario.insertCalls.push(row);
        scenario.existingRows = [
          { inquiry_id: row.inquiry_id, email_delivered: row.email_delivered },
        ];
        return new Response(JSON.stringify([row]), { status: 201 });
      }
      if (method === "PATCH") {
        scenario.patchCalls.push(JSON.parse(options.body));
        scenario.existingRows = scenario.existingRows.map((r) => ({
          ...r,
          email_delivered: true,
        }));
        return new Response("", { status: 204 });
      }
    }
    if (target.includes("api.resend.com")) {
      scenario.resendCalls += 1;
      return new Response(scenario.resendStatus === 200 ? '{"id":"re_1"}' : '{"error":true}', {
        status: scenario.resendStatus,
      });
    }
    return new Response("{}", { status: 500 });
  };
}

test.before(async () => {
  const { createBackendApp } = require("../dist/app");
  app = createBackendApp();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.on("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  server.closeAllConnections();
});

async function postBrief(payload) {
  const res = await realFetch(`${baseUrl}/api/assistant/brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() };
}

test("confirmed brief stores first and reports success only after delivery", async () => {
  const { status, body } = await postBrief(BRIEF);
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.status, "delivered");

  assert.equal(scenario.insertCalls.length, 1);
  const row = scenario.insertCalls[0];
  assert.equal(row.idempotency_key, BRIEF.idempotencyKey);
  assert.equal(row.source, "assistant_brief");
  assert.equal(row.company, "Bluebird Bakery");
  assert.equal(row.email, BRIEF.email);
  assert.equal(row.budget, "Unspecified");
  assert.match(row.message, /Requirements:/);
  assert.equal(row.brief_json.business, "Bluebird Bakery");

  assert.equal(scenario.resendCalls, 1);
  assert.equal(scenario.patchCalls.length, 1);
  assert.equal(scenario.patchCalls[0].email_delivered, true);
});

test("retrying an already delivered brief neither re-inserts nor re-emails", async () => {
  scenario.existingRows = [{ inquiry_id: "axb_existing", email_delivered: true }];
  const { status, body } = await postBrief(BRIEF);
  assert.equal(status, 200);
  assert.equal(body.status, "already_delivered");
  assert.equal(body.inquiryId, "axb_existing");
  assert.equal(scenario.insertCalls.length, 0);
  assert.equal(scenario.resendCalls, 0);
});

test("failed delivery resumes on retry with the same idempotency key", async () => {
  scenario.resendStatus = 500;
  const first = await postBrief(BRIEF);
  assert.equal(first.status, 502);
  assert.equal(first.body.code, "delivery_failed");
  assert.equal(first.body.stored, true);
  assert.equal(scenario.insertCalls.length, 1);
  assert.equal(scenario.resendCalls, 2); // initial + one internal retry

  // Visitor taps submit again: row exists undelivered, so delivery resumes.
  scenario.existingRows = [{ inquiry_id: scenario.insertCalls[0].inquiry_id, email_delivered: false }];
  scenario.resendStatus = 200;
  const second = await postBrief(BRIEF);
  assert.equal(second.status, 200);
  assert.equal(second.body.status, "delivered");
  assert.equal(scenario.insertCalls.length, 1); // still one row, no duplicate
  assert.equal(scenario.patchCalls.length, 1);
});

test("invalid briefs are rejected before touching storage", async () => {
  const { status, body } = await postBrief({ ...BRIEF, email: "not-an-email" });
  assert.equal(status, 400);
  assert.equal(body.code, "invalid_brief");
  assert.equal(scenario.insertCalls.length, 0);
  assert.equal(scenario.resendCalls, 0);
});
