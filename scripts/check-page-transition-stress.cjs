/* Optional browser QA dependencies live outside the application. */
const { chromium } = require('playwright');
const Chromium = require('@sparticuz/chromium').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch({ executablePath: await Chromium.executablePath(), args: Chromium.args.filter(a => a !== '--single-process') });
  const result = { samples: [], errors: [] };
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on('pageerror', error => result.errors.push(error.message));
    await page.addInitScript(() => {
      window.__contexts = [];
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const context = getContext.call(this, type, ...args);
        if (context && String(type).includes('webgl') && !window.__contexts.some(ref => ref.deref() === context)) window.__contexts.push(new WeakRef(context));
        return context;
      };
      window.__stableListeners = new Map();
      for (const target of [window, document]) {
        const add = target.addEventListener.bind(target), remove = target.removeEventListener.bind(target);
        target.addEventListener = (type, listener, options) => {
          if (['click','wheel','pointermove','resize','visibilitychange'].includes(type)) {
            const key=(target===window?'window:':'document:')+type;
            if (!window.__stableListeners.has(key)) window.__stableListeners.set(key,new Set());
            window.__stableListeners.get(key).add(listener);
          }
          return add(type,listener,options);
        };
        target.removeEventListener = (type,listener,options) => {
          window.__stableListeners.get((target===window?'window:':'document:')+type)?.delete(listener);
          return remove(type,listener,options);
        };
      }
    });
    const navigate = async href => {
      await page.evaluate(href => { const a=document.createElement('a');a.href=href;document.body.append(a);a.click();a.remove(); },href);
      await page.waitForURL(base+href);
      await page.waitForFunction(() => document.documentElement.dataset.pageTransition === 'idle',null,{timeout:20000});
    };
    await page.goto(base+'/company');
    await page.waitForTimeout(600);
    const session=await page.context().newCDPSession(page);
    await session.send('Performance.enable');
    for (let i=0;i<10;i++) {
      await navigate('/');
      await page.waitForTimeout(500);
      const home=await page.evaluate(()=>({ canvases:document.querySelectorAll('canvas').length, contexts:window.__contexts.map(r=>r.deref()).filter(c=>c&&!c.isContextLost()).length }));
      await navigate('/company');
      await page.waitForTimeout(300);
      await session.send('HeapProfiler.collectGarbage');
      const metrics=await session.send('Performance.getMetrics');
      const offHome=await page.evaluate(()=>({ canvases:document.querySelectorAll('canvas').length, contexts:window.__contexts.map(r=>r.deref()).filter(c=>c&&!c.isContextLost()).length, listeners:Object.fromEntries([...window.__stableListeners].map(([key,set])=>[key,set.size])), masks:document.querySelectorAll('.page-reveal-line').length, inert:document.querySelector('[data-transition-content]').hasAttribute('inert') }));
      assert.equal(offHome.contexts,0);
      assert.equal(offHome.masks,0);
      assert.equal(offHome.inert,false);
      result.samples.push({cycle:i+1,home,offHome,heap:metrics.metrics.find(m=>m.name==='JSHeapUsedSize').value});
      console.log('Completed cycle',i+1);
    }
    assert.deepEqual(result.samples.at(-1).offHome.listeners,result.samples[0].offHome.listeners);
    // Cold JIT/router caches can grow: record the heap, do not claim a leak-free proof.
    result.navigations=20;
    assert.deepEqual(result.errors,[]);
    fs.writeFileSync('/home/user/page-transition-qa/stress.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
