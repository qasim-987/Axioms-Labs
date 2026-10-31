const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
(async()=>{
 const browser=await chromium.launch({executablePath:await Chromium.executablePath(),args:Chromium.args.filter(a=>a!=='--single-process')});
 const result={};
 try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base+'/work');
  await page.waitForFunction(()=>Boolean(document.documentElement.dataset.pageTransition));
  await page.waitForTimeout(600);
  const idle=()=>page.waitForFunction(()=>document.documentElement.dataset.pageTransition==='idle',null,{timeout:12000});
  const click=href=>page.evaluate(href=>{const a=document.createElement('a');a.href=href;document.body.append(a);a.click();a.remove();},href);
  // In-page timing samples do not block behind screenshot encoding.
  await page.evaluate(()=>{window.__samples=[];const start=performance.now();window.__timer=setInterval(()=>{
   const overlay=document.querySelector('.page-transition-overlay');const band=overlay.querySelector('.page-transition-band');const curtain=overlay.querySelector('.page-transition-curtain');
   window.__samples.push({t:performance.now()-start,phase:overlay.dataset.phase,y:curtain.getBoundingClientRect().y,bandY:band.getBoundingClientRect().y,bandColor:getComputedStyle(band).backgroundColor,curtainColor:getComputedStyle(curtain).backgroundColor,lines:[...document.querySelectorAll('.page-reveal-line')].map(el=>getComputedStyle(el).transform)});
  },75);});
  await click('/company');await page.waitForURL(base+'/company');await idle();
  const samples=await page.evaluate(()=>{clearInterval(window.__timer);return window.__samples;});
  fs.writeFileSync('/home/user/page-transition-qa/timing.json',JSON.stringify(samples,null,2));
  result.coverY=samples.filter(x=>x.phase==='covering').map(x=>Math.round(x.y));
  result.maskedLineSamples=samples.filter(x=>x.lines.length).length;
  const visibleLine=samples.find(x=>x.phase==='revealing'&&x.lines.some(v=>{const values=v.match(/matrix\(([^)]+)\)/);return values&&Number(values[1].split(',')[5])<20;}));
  result.firstVisibleTextMs=visibleLine?.t;
  assert.ok(result.maskedLineSamples>0);
  // Modified/default-opt-out/same-page links must not enter the state machine.
  result.skipRules=await page.evaluate(()=>{
    const check=(href,attrs={},event={})=>{const a=document.createElement('a');a.href=href;Object.entries(attrs).forEach(([k,v])=>a.setAttribute(k,v));document.body.append(a);const e=new MouseEvent('click',{bubbles:true,cancelable:true,...event});a.dispatchEvent(e);a.remove();return e.defaultPrevented;};
    // Use a second bubble listener to prevent actual navigation after observing capture behavior.
    const seen=[];const stop=e=>{seen.push(e.defaultPrevented);e.preventDefault();};document.addEventListener('click',stop);
    check('/work',{}, {ctrlKey:true});check('/work',{}, {metaKey:true});check('/work',{}, {shiftKey:true});check('/work',{}, {altKey:true});check('/work',{}, {button:1});check('tel:+123456789');check('/work',{target:'_blank'});check('/work',{download:''});check('/work',{'data-transition':'none'});check('#top');check('mailto:qa@example.com');check('https://example.com/');
    document.removeEventListener('click',stop);return seen;
  });
  assert.ok(result.skipRules.every(x=>x===false));
  // Covering clicks are ignored, then waiting keeps only the latest request.
  await page.route('**/blog?edge=*',async route=>{await new Promise(r=>setTimeout(r,1200));await route.continue();});
  await click('/blog?edge=slow');
  await page.waitForFunction(()=>document.documentElement.dataset.pageTransition==='covering');
  await click('/contact');
  await page.waitForFunction(()=>document.documentElement.dataset.pageTransition==='waiting');
  await click('/work');await click('/services/ui-ux-design');
  await page.waitForURL(base+'/services/ui-ux-design');await idle();result.latestQueue=true;
  await page.unroute('**/blog?edge=*');
  // Force a genuinely uncached route request to remain pending beyond the watchdog.
  await page.route('**/company?watchdog=*',async route=>{await new Promise(r=>setTimeout(r,5500));await route.continue().catch(()=>{});});
  await click('/company?watchdog=1');
  await page.waitForFunction(()=>document.documentElement.dataset.pageTransition==='waiting');
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.page-transition-progress')).opacity)>.5);
  result.progressShown=true;
  await idle();
  assert.equal(await page.locator('[data-transition-content]').getAttribute('inert'),null);
  result.watchdogUnlocked=true;
  fs.writeFileSync('/home/user/page-transition-qa/edges.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
