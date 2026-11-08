// Browser QA uses external Playwright tooling, not an application dependency.
const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const assert = require('node:assert/strict');
const base=process.env.BASE_URL || 'http://127.0.0.1:3000';
const titles=['UI/UX Web Design','Web Development','AI Agents'];
(async()=>{
 const browser=await chromium.launch({executablePath:await Chromium.executablePath(),args:Chromium.args.filter(a=>a!=='--single-process')});
 try {
  const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/services');
  const list=await p.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent)).find(s=>s['@type']==='ItemList'));
  assert.deepEqual(list.itemListElement.map(x=>x.name),titles);
  for(const slug of ['ui-ux-design','web-development','ai-agents']){
   await p.goto(base+'/services/'+slug);
   const schema=await p.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent)).find(s=>s['@type']==='Service'));
   assert.ok(titles.includes(schema.name));
  }
  for(const slug of ['seo-aeo','video-editing','graphic-design']){
   const response=await p.goto(base+'/services/'+slug);assert.equal(response.status(),200);
   assert.match(await p.locator('main').innerText(),/not a standalone service/i);
   const hasService=await p.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.some(n=>JSON.parse(n.textContent)['@type']==='Service'));
   assert.equal(hasService,false);
   assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'),'https://www.axiomslab.com/services/'+slug);
  }
  for(const old of ['web-designing','gtm-strategy','digital-design']){
   const response=await p.request.get(base+'/services/'+old,{maxRedirects:0});assert.equal(response.status(),308);assert.equal(response.headers().location,'/services/ui-ux-design');
  }
  const sitemap=await (await p.request.get(base+'/sitemap.xml')).text();
  assert.ok(!sitemap.includes('/services/web-designing'));
  for(const slug of ['ui-ux-design','web-development','ai-agents','seo-aeo','video-editing','graphic-design'])assert.ok(sitemap.includes('/services/'+slug));
  await p.goto(base+'/contact');
  const labels=await p.locator('select').evaluateAll(nodes=>nodes.flatMap(s=>[...s.options].map(o=>o.textContent)));
  for(const title of titles)assert.ok(labels.includes(title));assert.ok(!labels.includes('Web Designing'));
  // Mobile normal motion: all three stages reachable forward/backward; no fourth control.
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'no-preference'});
  await p.goto(base+'/',{waitUntil:'networkidle'});
  const stage=p.locator('.mobile-services-stage');await stage.waitFor();await stage.scrollIntoViewIfNeeded();
  assert.equal(await stage.locator('.mobile-services-track > article').count(),3);
  for(const index of [1,2]){await stage.locator('[aria-label="Next service"]').evaluate(e=>e.click());await p.waitForFunction(i=>document.querySelector('.mobile-services-stage')?.dataset.activeStep===String(i),index);await p.waitForTimeout(700);}
  assert.ok(await stage.locator('[aria-label="Next service"]').isDisabled());
  for(const index of [1,0]){await stage.locator('[aria-label="Previous service"]').evaluate(e=>e.click());await p.waitForFunction(i=>document.querySelector('.mobile-services-stage')?.dataset.activeStep===String(i),index);await p.waitForTimeout(700);}
  assert.ok(await stage.locator('[aria-label="Previous service"]').isDisabled());
  assert.equal(await stage.locator('.mobile-card-transition').evaluate(e=>e.childElementCount),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: three active service schemas/listings, contact selections, 308 redirects, retained indexable resources without Service schema, sitemap, mobile forward/back and cleanup; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
