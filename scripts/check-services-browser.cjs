/* Optional isolated QA tool, not an application dependency.
   NODE_PATH=/path/to/browser-tools/node_modules USE_BUNDLED_CHROMIUM=1 node scripts/check-services-browser.cjs
   Or use Playwright's installed browser (omit USE_BUNDLED_CHROMIUM).
   Set BASE_URL to test a different build. Uses software GPU in bundled mode; NOT a 60fps benchmark. */
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:3000';
(async () => {
  const options = {headless: true};
  if (process.env.USE_BUNDLED_CHROMIUM) {
    const bin = require('@sparticuz/chromium').default;
    options.executablePath = await bin.executablePath();
    options.args = bin.args.filter(arg => arg !== '--single-process');
  }
  const browser = await chromium.launch(options);
  try {
    for (const [width, height] of [[1920,960],[1536,730],[1366,650],[1120,685],[1024,700],[360,640],[390,844],[768,1024],[820,1180],[667,375]]) {
      const page = await browser.newPage({viewport:{width,height},isMobile:width<1024,hasTouch:width<1024});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', {rate:4});
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      const start = await page.locator('#services').evaluate(el => scrollY + el.getBoundingClientRect().top - document.querySelector('[data-site-navbar]').getBoundingClientRect().height);
      for (const [progress, expected] of [[.075,0],[.385,1],[.695,2],[.96,3],[.695,2],[.385,1],[.075,0],[0,0]]) {
        await page.evaluate(top => window.scrollTo({top,behavior:'instant'}), start + progress * height * (width < 1024 ? 3.2 : 3.28));
        await page.waitForFunction(({expected, desktop}) => {
          const cards = [...document.querySelectorAll('#services [role=link]')];
          const active = cards[expected];
          if (!active || active.getAttribute('aria-hidden') === 'true') return false;
          const count = cards.filter(el => getComputedStyle(el).visibility !== 'hidden').length;
          return count === (desktop ? Math.min(3,4-expected) : 1) && getComputedStyle(active.querySelector('[class*="flex-col"]')).opacity === '1';
        }, {expected, desktop:width>=1024}, {timeout:20000});
        const result = await page.locator('#services').evaluate(section => {
          const cards = [...section.querySelectorAll('[role=link]')];
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            cards: cards.map(card => {
              const rect = card.getBoundingClientRect();
              const body = card.querySelector('[class*="flex-col"]');
              const p = card.querySelector('p'), list = card.querySelector('ul');
              return {
                active: card.getAttribute('aria-hidden') !== 'true',
                visible: getComputedStyle(card).visibility !== 'hidden',
                opacity: +getComputedStyle(card).opacity,
                tabIndex:card.tabIndex,
                linkTab:card.querySelector('a')?.tabIndex,
                pointer:getComputedStyle(card).pointerEvents,
                bottom:rect.bottom, right:rect.right,
                contentBottom:Math.max(...[...card.querySelectorAll('li')].map(el=>el.getBoundingClientRect().bottom)),
                overlap:!!(p && list && p.getBoundingClientRect().bottom > list.getBoundingClientRect().top),
                bodyOverflow:body ? body.scrollHeight-body.clientHeight : 0,
              };
            })
          };
        });
        const label = `${width}x${height} at ${progress}`;
        assert.equal(result.overflow,0,label);
        assert.equal(result.cards.filter(card=>card.active).length,1,label);
        const active = result.cards[expected];
        assert.ok(active.active,label);
        assert.ok(active.bottom <= height + 1,label);
        assert.ok(active.contentBottom <= active.bottom + 1,label);
        assert.equal(active.bodyOverflow,0,label);
        assert.equal(active.overlap,false,label);
        for (const card of result.cards) {
          if (card.visible) { assert.equal(card.opacity,1,label); assert.ok(card.right <= width - (width >= 1024 ? 16 : 0),label); }
          if (!card.active) { assert.equal(card.tabIndex,-1,label); assert.equal(card.linkTab,-1,label); assert.equal(card.pointer,'none',label); }
        }
        if (width >= 1024 && progress > 0) assert.equal(result.cards.filter(card=>card.visible).length, Math.min(3,4-expected),label);
      }
      assert.deepEqual(errors,[],`${width}x${height} console/page errors`);
      await page.close();
      console.log(`PASS ${width}x${height}: all four cards forward/reverse, fit, opaque shells, accessibility, deck bounds`);
    }
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
