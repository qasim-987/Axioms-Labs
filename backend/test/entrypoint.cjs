// Exercise the module Vercel selected in production, not just the app factory.
process.env.VERCEL = '1';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../dist/app').default;
const indexApp = require('../dist/index').default;
assert.equal(typeof app, 'function', 'Vercel entrypoint must export a callable app');
assert.equal(indexApp, app, 'standalone and discovered entrypoints reuse the app');
const server = app.listen(0, '127.0.0.1');
const ready = new Promise(resolve => server.on('listening', resolve));
after(() => { server.close(); server.closeAllConnections(); });
for (const route of ['/', '/api/health', '/api/services', '/api/contact/status']) {
  test(`Vercel app responds at ${route}`, async () => {
    await ready;
    const res = await fetch(`http://127.0.0.1:${server.address().port}${route}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/json/);
    const body = await res.json();
    if (route === '/api/contact/status') assert.deepEqual(body, { operational: true });
  });
}
