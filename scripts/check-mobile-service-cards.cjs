// External QA dependencies: playwright and @sparticuz/chromium (not app dependencies).
const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({executablePath: await Chromium.executablePath(), args: Chromium.args.filter(a=>a!=='--single-process')});
  const results = [];
  const output = process.env.QA_OUTPUT || '/home/user/mobile-card-qa';
  fs.mkdirSync(output,{recursive:true});
  try {
    for (const reducedMotion of ['no-preference','reduce']) {
      const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion});
      const page = await context.newPage(), errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto((process.env.BASE_URL || 'http://127.0.0.1:3000')+'/',{waitUntil:'networkidle'});
      const stage=page.locator('.mobile-services-stage');
      // Reduced motion may use the existing static ServicesGrid fallback instead.
      if (await stage.count()) {
        await stage.scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        assert.equal(await stage.locator('.mobile-services-shape canvas').count(),0);
        const card=stage.locator('.mobile-services-track > article').first();
        assert.equal(await card.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(64, 62, 124)');
        const columns=await stage.locator('.mobile-services-row').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
        assert.equal(columns,1);
        await stage.locator('[aria-label="Next service"]').evaluate(el=>el.click());
        await page.waitForFunction(()=>document.querySelector('.mobile-services-stage').dataset.activeStep==='1');
        await page.waitForTimeout(800);
        assert.equal(await stage.locator('.mobile-card-transition').evaluate(el=>el.childElementCount),0);
        await page.screenshot({path:output+'/'+reducedMotion+'-forward.png'});
        await stage.locator('[aria-label="Previous service"]').evaluate(el=>el.click());
        await page.waitForFunction(()=>document.querySelector('.mobile-services-stage').dataset.activeStep==='0');
        await page.waitForTimeout(800);
        assert.equal(await stage.locator('.mobile-card-transition').evaluate(el=>el.childElementCount),0);
        await page.screenshot({path:output+'/'+reducedMotion+'-reverse.png'});
        results.push({reducedMotion,phoneShapeAbsent:true,color:true,singleColumn:true,forward:true,reverse:true,cloneCleanup:true,errors});
      } else {
        assert.equal(reducedMotion,'reduce');
        assert.ok(await page.locator('#services').count());
        results.push({reducedMotion,existingStaticFallback:true,errors});
      }
      assert.deepEqual(errors,[]);
      await context.close();
    }
    fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
