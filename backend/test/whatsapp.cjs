process.env.SUPABASE_URL = "http://127.0.0.1:4398";
process.env.SUPABASE_SERVICE_ROLE_KEY = "wa-regression-key";
process.env.WHATSAPP_VERIFY_TOKEN = "test-verify-token";
process.env.WHATSAPP_APP_SECRET = "test-app-secret";
process.env.WHATSAPP_ACCESS_TOKEN = "test-graph-token";
process.env.WHATSAPP_PHONE_NUMBER_ID = "100001";
process.env.WHATSAPP_API_VERSION = "v25.0";

const crypto = require("node:crypto");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const realFetch = global.fetch.bind(global);

const scenario = { paused: false, duplicate: false, graphFail: false, sends: [], patches: [], inserts: [] };

function mockFetch(t) {
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.includes("graph.facebook.com")) {
      scenario.sends.push(JSON.parse(options.body));
      if (scenario.graphFail) return new Response(JSON.stringify({ error: { message: "boom" } }), { status: 500 });
      return new Response(JSON.stringify({ messaging_product: "whatsapp", messages: [{ id: "out.1" }] }), { status: 200 });
    }
    if (target.includes("/rest/v1/whatsapp_threads")) {
      return new Response(JSON.stringify([{ sender_phone: "923001234567", automation_enabled: !scenario.paused }]), { status: 201 });
    }
    if (target.includes("/rest/v1/whatsapp_messages")) {
      const method = options.method || "GET";
      if (method === "POST") {
        scenario.inserts.push(JSON.parse(options.body));
        if (scenario.duplicate) return new Response(JSON.stringify({ code: "23505" }), { status: 409 });
        return new Response("", { status: 201 });
      }
      if (method === "PATCH") {
        scenario.patches.push({ url: target, body: JSON.parse(options.body) });
        return { ok: true, status: 204, async json() { return null; } };
      }
    }
    return new Response("{}", { status: 500 });
  };
  t.after(() => {
    global.fetch = realFetch;
  });
}

const sign = (body) =>
  "sha256=" + crypto.createHmac("sha256", "test-app-secret").update(Buffer.from(body)).digest("hex");

const textEvent = (wamid = "WA.MSG.1") =>
  JSON.stringify({
    object: "whatsapp_business_account",
    entry: [
      {
        id: "100001",
        changes: [
          {
            field: "messages",
            value: {
              contacts: [{ profile: { name: "Test User" }, wa_id: "923001234567" }],
              messages: [
                { from: "923001234567", id: wamid, timestamp: "1795000000", type: "text", text: { body: "Assalam o alaikum, price?" } },
              ],
            },
          },
        ],
      },
    ],
  });

const statusesEvent = JSON.stringify({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "100001",
      changes: [
        {
          field: "messages",
          value: { statuses: [{ id: "out.1", status: "read", recipient_id: "923001234567" }] },
        },
      ],
    },
  ],
});

let baseUrl;
let server;

test.before(async () => {
  const { createBackendApp } = require("../dist/app");
  server = createBackendApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.on("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  server.closeAllConnections();
});

async function postWebhook(body, { signature } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (signature !== null) headers["X-Hub-Signature-256"] = signature || sign(body);
  const res = await realFetch(`${baseUrl}/api/whatsapp/webhook`, { method: "POST", headers, body });
  return { status: res.status, body: await res.json().catch(() => null) };
}

test("meta handshake echoes the challenge only for the right verify token", async () => {
  const ok = await realFetch(
    `${baseUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=12345`
  );
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), "12345");

  const bad = await realFetch(
    `${baseUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345`
  );
  assert.equal(bad.status, 403);
});

test("unsigned and tampered payloads are rejected", async () => {
  const body = textEvent();
  assert.equal((await postWebhook(body, { signature: null })).status, 401);
  assert.equal((await postWebhook(body, { signature: "sha256=" + "0".repeat(64) })).status, 401);
});

test("a signed text message gets exactly one fixed reply", async (t) => {
  mockFetch(t);
  const res = await postWebhook(textEvent("WA.MSG.A"));
  assert.equal(res.status, 200);
  assert.equal(res.body.received, 1);
  assert.equal(res.body.replied, 1);
  assert.equal(scenario.sends.length, 1);
  assert.equal(scenario.sends[0].to, "923001234567");
  assert.equal(scenario.sends[0].type, "text");
  assert.match(scenario.sends[0].text.body, /Axioms Lab/);
  assert.equal(scenario.inserts.find((i) => i.role === "user").status, "pending");
});

test("delivery receipts are ignored for reply generation", async (t) => {
  mockFetch(t);
  scenario.sends = [];
  const res = await postWebhook(statusesEvent);
  assert.equal(res.status, 200);
  assert.equal(res.body.received, 0);
  assert.equal(scenario.sends.length, 0);
});

test("meta retries with the same message id never double-reply", async (t) => {
  mockFetch(t);
  scenario.duplicate = true;
  scenario.sends = [];
  t.after(() => {
    scenario.duplicate = false;
  });
  const res = await postWebhook(textEvent("WA.MSG.DUP"));
  assert.equal(res.status, 200);
  assert.equal(res.body.duplicates, 1);
  assert.equal(res.body.replied, 0);
  assert.equal(scenario.sends.length, 0);
});

test("paused threads store the message but send nothing", async (t) => {
  mockFetch(t);
  scenario.paused = true;
  scenario.sends = [];
  t.after(() => {
    scenario.paused = false;
  });
  const res = await postWebhook(textEvent("WA.MSG.PAUSED"));
  assert.equal(res.status, 200);
  assert.equal(res.body.paused, 1);
  assert.equal(scenario.sends.length, 0);
});

test("graph failures are acked, marked failed, and never crash the webhook", async (t) => {
  mockFetch(t);
  scenario.graphFail = true;
  t.after(() => {
    scenario.graphFail = false;
  });
  const res = await postWebhook(textEvent("WA.MSG.FAIL"));
  assert.equal(res.status, 200);
  assert.equal(res.body.failed, 1);
  assert.deepEqual(scenario.patches.at(-1).body, { status: "failed" });
});
