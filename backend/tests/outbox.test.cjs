const { test } = require('node:test');
const assert = require('node:assert/strict');
const { env } = require('../dist/config/env');
const { enqueueInquiry } = require('../dist/services/outbox.service');
const { deliverOutbox } = require('../dist/workers/deliverOutbox');

test('durable enqueue and notification worker contracts', async () => {
  const oldFetch = global.fetch;
  const saved = { ...env };
  env.supabaseUrl = 'https://database.invalid'; env.supabaseServiceRoleKey = 'test-only';
  env.contactWebhookUrl = 'https://webhook.invalid';
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    if (url.endsWith('/enqueue_inquiry')) return Response.json({ id: 'axs_test', receivedAt: '2026-10-30T00:00:00Z' });
    return new Response(null, { status: 503 });
  };
  try {
    const payload = { firstName: 'QA', lastName: '', email: 'qa@example.com', company: '', service: 'Web', budget: '', message: 'A detailed test inquiry', phone: '', countryCode: '', source: 'test' };
    assert.equal((await enqueueInquiry(payload)).id, 'axs_test');
    await enqueueInquiry({ ...payload, formLoadedAt: 1234 });
    assert.equal(calls[0].body.p_record.request_key, calls[1].body.p_record.request_key);
    assert.deepEqual(calls[0].body.p_channels, ['webhook']);
    global.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(() => enqueueInquiry(payload), /Outbox enqueue_inquiry failed/);
    const id = '31c26136-f313-4d93-bbca-0667402b1acb';
    global.fetch = async (url, init) => {
      const body = JSON.parse(init.body);
      if (url.endsWith('/claim_inquiry_jobs')) return Response.json([{ id, lease_token: id, channel: 'webhook', attempts: 1, inquiry: { inquiry_id: 'axs_test', email: payload.email, client_name: 'QA', service: 'Web', budget: '', message: payload.message, phone: '', company: '', source: 'qa' } }]);
      if (url === env.contactWebhookUrl) { assert.equal(init.headers['Idempotency-Key'], id); return new Response(null, { status: 503 }); }
      assert.equal(body.p_success, false);
      assert.equal(body.p_token, id);
      return new Response(null, { status: 204 });
    };
    await deliverOutbox();
  } finally { global.fetch = oldFetch; Object.assign(env, saved); }
});
