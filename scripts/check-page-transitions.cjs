/* Isolated QA: NODE_PATH must include playwright and @sparticuz/chromium.
 * BASE_URL defaults to the local production server. No contact requests are sent. */
const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.QA_OUTPUT || '/home/user/page-transition-qa';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: await Chromium.executablePath(), args: Chromium.args.filter(a => a !== '--single-process') });
  const errors = [], result = {};
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/company');
    await page.waitForTimeout(1400);
    await page.evaluate(() => { window.__navIdentity = document.querySelector('[data-site-navbar]'); });
    assert.equal(await page.locator('.page-transition-overlay').getAttribute('data-phase'), 'idle');
    await page.locator('nav[aria-label="Primary Navigation"] a[href="/work"]').click();
    const frames = [];
    for (let i = 0; i < 30; i++) {
      frames.push(await page.evaluate(() => {
        const el = document.querySelector('.page-transition-overlay');
        const curtain = el.querySelector('.page-transition-curtain');
        const band = el.querySelector('.page-transition-band');
        const nav = document.querySelector('[data-site-navbar]');
        return { time: performance.now(), phase: el.dataset.phase, curtain: getComputedStyle(curtain).backgroundColor, band: getComputedStyle(band).backgroundColor, rect: curtain.getBoundingClientRect().toJSON(), navSame: nav === window.__navIdentity, navTop: nav.getBoundingClientRect().top, masks: document.querySelectorAll('.page-reveal-line').length, title: document.title, inert: document.querySelector('[data-transition-content]').hasAttribute('inert') };
      }));
      await page.screenshot({ path: `${output}/frame-${String(i).padStart(2,'0')}.png` });
      await page.waitForTimeout(60);
    }
    fs.writeFileSync(`${output}/frames.json`, JSON.stringify(frames, null, 2));
    assert.ok(frames.some(f => f.phase === 'covering'));
    assert.ok(frames.some(f => f.phase === 'waiting' || f.phase === 'revealing'));
    assert.ok(frames.some(f => f.masks > 0));
    assert.ok(frames.every(f => f.navSame && f.navTop === 0));
    assert.ok(frames.every(f => f.curtain === 'rgb(18, 19, 23)' && f.band === 'rgb(49, 134, 255)'));
    await page.waitForFunction(() => document.documentElement.dataset.pageTransition === 'idle');
    assert.equal(await page.locator('[data-transition-content]').getAttribute('inert'), null);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
    result.frames = frames.length;
    result.firstRevealMs = frames.find(f => f.masks > 0).time - frames[0].time;
    // All primary destinations plus representative service and article links.
    for (const href of ['/company','/blog','/contact','/services/ui-ux-design','/services/web-development','/services/web-designing','/services/ai-agents','/work','/']) {
      await page.evaluate(href => { const a = document.createElement('a'); a.href=href; a.textContent='QA navigation'; a.id='qa-link'; document.body.append(a); }, href);
      await page.locator('#qa-link').click();
      console.log('Checking', href);
      await page.waitForURL(base + href);
      await page.waitForFunction(() => document.documentElement.dataset.pageTransition === 'idle', null, { timeout: 15000 });
      await page.locator('#qa-link').evaluate(a => a.remove());
    }
    result.primaryRoutes = 9;
    await page.goBack();
    await page.waitForFunction(() => document.documentElement.dataset.pageTransition === 'idle');
    assert.equal(await page.evaluate(() => window.__navIdentity === document.querySelector('[data-site-navbar]')), true);
    result.back = true;
    await page.goForward();
    await page.waitForFunction(() => document.documentElement.dataset.pageTransition === "idle", null, { timeout: 15000 });
    result.forward = true;
    await context.close();
    for (const reducedMotion of ['no-preference','reduce']) {
      const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion });
      const p = await mobile.newPage(); p.on('pageerror', e => errors.push(e.message));
      await p.goto(base + '/company');
      await p.waitForTimeout(400);
      await p.locator('a[href="/work"]').last().click();
      await p.waitForURL(base + '/work');
      await p.waitForFunction(() => document.documentElement.dataset.pageTransition === 'idle', null, { timeout: 15000 });
      assert.equal(await p.locator('.page-reveal-line').count(), 0);
      assert.equal(await p.locator('[data-transition-content]').getAttribute('inert'), null);
      result[`mobile-${reducedMotion}`] = true;
      await mobile.close();
    }
    result.errors = errors;
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(result, null, 2));
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
