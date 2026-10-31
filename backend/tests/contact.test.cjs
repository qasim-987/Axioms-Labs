const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const dir = mkdtempSync(path.join(tmpdir(), 'axiom-contact-'));
process.env.NODE_ENV = 'production';
process.env.INQUIRY_DATA_DIR = dir;
process.env.RESEND_API_KEY = '';
process.env.CONTACT_WEBHOOK_URL = '';
process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.TRUST_PROXY = '';
const { createBackendApp } = require('../dist/app');
const { env } = require('../dist/config/env');
const payload = { firstName: 'Test', email: 'test@example.com', message: 'A valid test project inquiry.' };

test('contact API production safeguards', async (t) => {
  const server = createBackendApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, headers = {}) => fetch(`${base}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  try {
    await t.test('malformed honeypot input is rejected, not a server crash', async () => {
      assert.equal((await post({ ...payload, botField: {} })).status, 400);
    });
    await t.test('invalid email rejected', async () => {
      assert.equal((await post({ ...payload, email: 'bad' })).status, 400);
    });
    await t.test('honeypot trapped without delivery', async () => {
      assert.equal((await post({ ...payload, botField: 'spam' })).status, 200);
    });
    await t.test('no external delivery never reports success in production', async () => {
      const res = await post(payload);
      assert.equal(res.status, 503);
      assert.equal((await res.json()).success, false);
    });
    await t.test('external acceptance produces a reference', async () => {
      const realFetch = global.fetch;
      env.contactWebhookUrl = 'https://delivery.invalid/test';
      global.fetch = (url, init) => String(url) === env.contactWebhookUrl
        ? Promise.resolve(new Response(null, { status: 204 })) : realFetch(url, init);
      try {
        const res = await post(payload);
        assert.equal(res.status, 200);
        assert.match((await res.json()).inquiryId, /^axs_/);
      } finally { global.fetch = realFetch; env.contactWebhookUrl = ''; }
    });
    await t.test('rejected external delivery returns a retryable failure', async () => {
      const realFetch = global.fetch;
      env.contactWebhookUrl = 'https://delivery.invalid/test';
      global.fetch = (url, init) => String(url) === env.contactWebhookUrl
        ? Promise.resolve(new Response(null, { status: 503 })) : realFetch(url, init);
      try { assert.equal((await post(payload)).status, 503); }
      finally { global.fetch = realFetch; env.contactWebhookUrl = ''; }
    });
    await t.test('unlisted browser origin is not granted CORS access', async () => {
      const res = await fetch(`${base}/api/health`, { headers: { Origin: 'https://untrusted.invalid' } });
      assert.equal(res.headers.get('access-control-allow-origin'), null);
    });
    await t.test('malformed JSON and oversized bodies return JSON errors', async () => {
      const invalid = await post('{');
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).success, false);
      assert.equal((await post({ ...payload, message: 'x'.repeat(40000) })).status, 413);
    });
    await t.test('public status does not disclose adapters or lead counts', async () => {
      assert.deepEqual(await (await fetch(`${base}/api/contact/status`)).json(), { operational: true });
    });
    await t.test('changing spoofed forwarded IPs cannot bypass the limiter', async () => {
      let res;
      for (let i = 0; i < 12; i++) res = await post({}, { 'X-Forwarded-For': `198.51.100.${i}` });
      assert.equal(res.status, 429);
      assert.ok(res.headers.get('retry-after'));
    });
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
