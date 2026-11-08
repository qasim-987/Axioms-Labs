// Offline integration test: no real mail, credentials, or external network calls.
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'axioms-email-test-'));
const originalAppend = fs.appendFileSync;
fs.appendFileSync = (file, ...args) => originalAppend(path.join(tmp, path.basename(file)), ...args);
process.env.RESEND_API_KEY = 'offline-test-only';
process.env.CONTACT_NOTIFICATION_EMAIL = 'info@axiomslab.com';
const express = require('express');
const { contactRouter } = require('../dist/routes/contact.routes');
const { env } = require('../dist/config/env');
const realFetch = global.fetch;
let providerStatus = 200;
let lastEmail;
global.fetch = async (url, options) => {
  assert.equal(url, 'https://api.resend.com/emails');
  lastEmail = JSON.parse(options.body);
  return new Response('{}', { status: providerStatus });
};
const app = express();
app.use(express.json());
app.use(contactRouter);
const server = app.listen(0, '127.0.0.1');
const ready = new Promise(resolve => server.on('listening', resolve));
async function submit() {
  await ready;
  return realFetch(`http://127.0.0.1:${server.address().port}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'Offline Test', email: 'client@example.com', message: 'Testing project inquiry delivery.', formLoadedAt: Date.now() - 20000 }),
  });
}
after(() => { server.close(); server.closeAllConnections(); global.fetch = realFetch; fs.appendFileSync = originalAppend; fs.rmSync(tmp, { recursive: true, force: true }); });
test('verified sender, owner recipient, visitor Reply-To and provider acceptance', async () => {
  const res = await submit();
  assert.equal(res.status, 200);
  assert.ok((await res.json()).deliveryChannels.includes('resend_email'));
  assert.equal(lastEmail.from, 'Axioms Lab <info@axiomslab.com>');
  assert.deepEqual(lastEmail.to, ['info@axiomslab.com']);
  assert.equal(lastEmail.reply_to, 'client@example.com');
  assert.ok(lastEmail.text.includes('Testing project inquiry delivery.'));
});
test('provider rejection does not show a false success', async () => {
  providerStatus = 403;
  const res = await submit();
  assert.equal(res.status, 503);
  assert.ok((await res.json()).error.includes('email info@axiomslab.com'));
});
test('provider network failure returns safe failure', async () => {
  global.fetch = async () => { throw new Error('Offline simulated timeout'); };
  assert.equal((await submit()).status, 503);
});
test('missing API key does not show a false success', async () => {
  env.resendApiKey = '';
  assert.equal((await submit()).status, 503);
});
