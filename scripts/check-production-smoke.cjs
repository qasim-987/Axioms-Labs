/* Optional QA tooling: install playwright and @sparticuz/chromium outside the app,
 * then supply NODE_PATH (and LD_LIBRARY_PATH if needed). No production requests
 * are submitted: every contact POST is intercepted. BASE_URL defaults to local. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ executablePath: await Chromium.executablePath(), args: Chromium.args.filter(arg => arg !== "--single-process") });
  const results = [];
  try {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // Force the supported static fallback path.
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (String(type).includes('webgl')) return null;
          return original.call(this, type, ...args);
        };
      });
      for (const route of ['/', '/contact', '/services/ui-ux-design', '/services/web-development', '/services/web-designing', '/services/ai-agents']) {
        let mode = 'error';
        let submissions = 0;
        await page.route('**/api/contact', async intercepted => {
          submissions++;
          await intercepted.fulfill(mode === 'error'
            ? { status: 503, contentType: 'text/html', body: '<html>Unavailable</html>' }
            : { status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, inquiryId: 'axs_qa', message: 'QA inquiry received.', receivedAt: new Date().toISOString() }) });
        });
        const response = await page.goto(base + route);
        assert.equal(response.status(), 200);
        await page.locator('h1').waitFor();
        const form = page.locator('form').first();
        await form.waitFor();
        for (const input of await form.locator('input:not([name="botField"]):not([name="websiteUrl"])').all()) {
          if (!(await input.isVisible())) continue;
          await input.fill((await input.getAttribute('type')) === 'email' ? 'qa@example.com' : 'QA Tester');
        }
        for (const select of await form.locator('select').all()) {
          const value = await select.locator('option').evaluateAll(options => options.find(o => o.value && !o.disabled)?.value);
          if (value) await select.selectOption(value);
        }
        const message = form.locator('textarea');
        await message.fill('A sufficiently detailed QA project inquiry for testing.');
        const submit = form.locator('button[type="submit"]');
        await submit.click();
        await page.waitForFunction(() => document.body.innerText.includes('Unable to submit your inquiry.'));
        assert.ok((await message.inputValue()).includes('QA project'));
        mode = 'success';
        await submit.click();
        await page.waitForFunction(() => document.body.innerText.includes('axs_qa') || document.body.innerText.includes('QA inquiry received.'));
        assert.equal(submissions, 2);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `Horizontal overflow: ${route}`);
        results.push({ route, reducedMotion, formErrorRetention: true, formSuccess: true, noWebGL: true, noOverflow: true });
        await page.unroute('**/api/contact');
      }
      assert.deepEqual(errors, [], `Runtime errors (${reducedMotion})`);
      await context.close();
    }
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
