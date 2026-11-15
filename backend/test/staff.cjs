process.env.GROQ_API_KEY = "staff-regression-key";
process.env.SUPABASE_URL = "http://127.0.0.1:4399";
process.env.SUPABASE_SERVICE_ROLE_KEY = "sb-regression-key";
process.env.STAFF_EMAILS = "staff@axiomslab.com";

const crypto = require("node:crypto");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const realFetch = global.fetch.bind(global);

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const pubJwk = publicKey.export({ format: "jwk" });
pubJwk.kid = "test-kid";
pubJwk.alg = "RS256";
pubJwk.use = "sig";

// Supabase production signs staff JWTs with ES256 (P-256), raw IEEE-P1363
// signatures - covered explicitly so the verifier can't regress to RSA-only.
const ec = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const ecPubJwk = ec.publicKey.export({ format: "jwk" });
ecPubJwk.kid = "ec-kid";
ecPubJwk.alg = "ES256";
ecPubJwk.use = "sig";

const b64u = (value) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");

function signToken(payload, { es256 = false } = {}) {
  const head = es256
    ? b64u({ alg: "ES256", typ: "JWT", kid: "ec-kid" })
    : b64u({ alg: "RS256", typ: "JWT", kid: "test-kid" });
  const body = b64u(payload);
  const sig = es256
    ? crypto
        .sign("SHA256", Buffer.from(`${head}.${body}`), {
          key: ec.privateKey,
          dsaEncoding: "ieee-p1363",
        })
        .toString("base64url")
    : crypto
        .sign("RSA-SHA256", Buffer.from(`${head}.${body}`), privateKey)
        .toString("base64url");
  return `${head}.${body}.${sig}`;
}

const validPayload = (over = {}) => ({
  iss: "http://127.0.0.1:4399/auth/v1",
  aud: "authenticated",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  // Unique per mint so the backend introspection cache (keyed by token)
  // cannot bleed results between tests signed in the same second.
  sub: `user-${Math.random().toString(36).slice(2)}`,
  email: "staff@axiomslab.com",
  ...over,
});

const scenario = {
  rows: [],
  patches: [],
  notes: [],
  es256: false,
  // Introspection (GoTrue /auth/v1/user) behaviour for this test.
  introspectStatus: 200,
  introspectEmail: null, // null = echo the bearer token's email claim
};

function mockFetch(t) {
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) {
      if (scenario.introspectStatus !== 200) {
        return new Response(JSON.stringify({ message: "introspection down" }), {
          status: scenario.introspectStatus,
        });
      }
      const bearer = (options.headers && options.headers.Authorization) || "";
      let claimEmail = "";
      try {
        claimEmail = JSON.parse(
          Buffer.from(bearer.replace("Bearer ", "").split(".")[1], "base64url").toString()
        ).email;
      } catch {
        claimEmail = "";
      }
      return new Response(
        JSON.stringify({ id: "user-1", email: scenario.introspectEmail || claimEmail }),
        { status: 200 }
      );
    }
    if (target.includes(".well-known/jwks.json")) {
      return new Response(
        JSON.stringify({ keys: scenario.es256 ? [ecPubJwk] : [pubJwk] }),
        { status: 200 }
      );
    }
    if (target.includes("/rest/v1/staff_followup_notes")) {
      const method = options.method || "GET";
      if (method === "POST") {
        scenario.notes.push(JSON.parse(options.body));
        return { ok: true, status: 201, async json() { return null; } };
      }
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (target.includes("/rest/v1/contact_inquiries")) {
      const method = options.method || "GET";
      if (method === "PATCH") {
        scenario.patches.push(JSON.parse(options.body));
        // 204 = no body allowed in the WHATWG Response ctor.
        return { ok: true, status: 204, async json() { return null; } };
      }
      if (target.includes("staff_followup") === false && target.includes("select=") && target.includes("message,brief_json")) {
        return new Response(
          JSON.stringify([
            {
              inquiry_id: "axb_1",
              company: "Demo Co",
              service: "Web Development",
              status: "new",
              budget: "Unspecified",
              client_name: "Qasim",
              email: "q@example.com",
              received_at: "2026-11-14T19:48:51.901Z",
              source: "assistant_brief",
              message: "Requirements text",
              brief_json: { business: "Demo Co" },
              conversation_context: null,
            },
          ]),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify(scenario.rows), { status: 200 });
    }
    return new Response("{}", { status: 500 });
  };
  t.after(() => {
    global.fetch = realFetch;
  });
}

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

async function call(path, { token, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await realFetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

test("staff endpoints reject missing tokens", async (t) => {
  mockFetch(t);
  const res = await call("/api/staff/inquiries");
  assert.equal(res.status, 401);
  assert.equal(res.body.code, "unauthorized");
});

test("staff endpoints reject tampered or expired tokens", async (t) => {
  mockFetch(t);
  const good = signToken(validPayload());
  const [h, p, s] = good.split(".");
  const tampered = `${h}.${b64u(JSON.stringify({ ...JSON.parse(Buffer.from(p, "base64url").toString()), email: "intruder@example.com" }))}.${s}`;
  assert.equal((await call("/api/staff/inquiries", { token: tampered })).status, 401);

  const expired = signToken(validPayload({ exp: Math.floor(Date.now() / 1000) - 60 }));
  assert.equal((await call("/api/staff/inquiries", { token: expired })).status, 401);

  // Genuine signature, live account, but not on the allowlist -> 403.
  const outsider = signToken(validPayload({ email: "friend@example.com" }));
  const outsiderRes = await call("/api/staff/inquiries", { token: outsider });
  assert.equal(outsiderRes.status, 403);
  assert.equal(outsiderRes.body.code, "forbidden");
});

test("verified staff can list and inspect inquiries", async (t) => {
  mockFetch(t);
  scenario.rows = [
    {
      inquiry_id: "axb_1",
      company: "Demo Co",
      service: "Web Development",
      status: "new",
      budget: "Unspecified",
      client_name: "Qasim",
      email: "q@example.com",
      received_at: "2026-11-14T19:48:51.901Z",
      source: "assistant_brief",
    },
  ];
  const token = signToken(validPayload());
  const list = await call("/api/staff/inquiries", { token });
  assert.equal(list.status, 200);
  assert.equal(list.body.inquiries.length, 1);
  assert.equal(list.body.inquiries[0].company, "Demo Co");

  const detail = await call("/api/staff/inquiries/axb_1", { token });
  assert.equal(detail.status, 200);
  assert.equal(detail.body.inquiry.company, "Demo Co");
  assert.deepEqual(detail.body.inquiry.notes, []);
});

test("status changes are validated and persisted", async (t) => {
  mockFetch(t);
  const token = signToken(validPayload());
  const bad = await call("/api/staff/inquiries/axb_1", {
    token,
    method: "PATCH",
    body: { status: "archived" },
  });
  assert.equal(bad.status, 400);

  const ok = await call("/api/staff/inquiries/axb_1", {
    token,
    method: "PATCH",
    body: { status: "under_discussion" },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.status, "under_discussion");
  assert.deepEqual(scenario.patches.at(-1), { status: "under_discussion" });
});

test("tokens claiming an over-long lifetime are rejected", async (t) => {
  mockFetch(t);
  const now = Math.floor(Date.now() / 1000);
  const longLived = signToken(validPayload({ iat: now - 10_000, exp: now + 3600 }));
  assert.equal((await call("/api/staff/inquiries", { token: longLived })).status, 401);
});

test("deleted or banned accounts are rejected via introspection", async (t) => {
  mockFetch(t);
  scenario.introspectStatus = 401;
  t.after(() => {
    scenario.introspectStatus = 200;
  });
  const token = signToken(validPayload());
  assert.equal((await call("/api/staff/inquiries", { token: token })).status, 401);
});

test("unreachable auth service fails closed with 503", async (t) => {
  mockFetch(t);
  scenario.introspectStatus = 500;
  t.after(() => {
    scenario.introspectStatus = 200;
  });
  const token = signToken(validPayload());
  const res = await call("/api/staff/inquiries", { token });
  assert.equal(res.status, 503);
  assert.equal(res.body.code, "auth_unavailable");
});

test("allowlist is enforced against the server-confirmed email", async (t) => {
  mockFetch(t);
  scenario.rows = [];
  // JWT says staff, GoTrue says intruder -> forbidden.
  scenario.introspectEmail = "intruder@example.com";
  const mismatched = signToken(validPayload());
  assert.equal((await call("/api/staff/inquiries", { token: mismatched })).status, 403);

  // Stale JWT claim, server confirms a staff email -> allowed.
  scenario.introspectEmail = "staff@axiomslab.com";
  const staleClaim = signToken(validPayload({ email: "old@axiomslab.com" }));
  const ok = await call("/api/staff/inquiries", { token: staleClaim });
  assert.equal(ok.status, 200);
  scenario.introspectEmail = null;
});

test("ES256 tokens (Supabase production algorithm) are accepted", async (t) => {
  mockFetch(t);
  scenario.es256 = true;
  scenario.rows = [];
  t.after(() => {
    scenario.es256 = false;
  });
  const token = signToken(validPayload(), { es256: true });
  const res = await call("/api/staff/inquiries", { token });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  // A DER-encoded ECDSA signature (wrong JWS format) must still be rejected.
  const [h, p] = token.split(".");
  const derSig = crypto
    .sign("SHA256", Buffer.from(`${h}.${p}`), ec.privateKey)
    .toString("base64url");
  const derToken = `${h}.${p}.${derSig}`;
  assert.equal((await call("/api/staff/inquiries", { token: derToken })).status, 401);
});

test("follow-up notes are authored with the verified staff email", async (t) => {
  mockFetch(t);
  const token = signToken(validPayload());
  const empty = await call("/api/staff/inquiries/axb_1/notes", {
    token,
    method: "POST",
    body: { body: "   " },
  });
  assert.equal(empty.status, 400);

  const ok = await call("/api/staff/inquiries/axb_1/notes", {
    token,
    method: "POST",
    body: { body: "Called the client, demo scheduled." },
  });
  assert.equal(ok.status, 200);
  assert.equal(scenario.notes.at(-1).author, "staff@axiomslab.com");
  assert.equal(scenario.notes.at(-1).body, "Called the client, demo scheduled.");
});
