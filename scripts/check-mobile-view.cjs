/* Optional browser QA; no app dependencies added.
   NODE_PATH=/path/to/browser-tools/node_modules USE_BUNDLED_CHROMIUM=1 node scripts/check-mobile-view.cjs
   BASE_URL defaults to http://localhost:3000. Bundled software WebGL is not a phone GPU benchmark. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.BASE_URL || 'http://localhost:3000';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  const options={headless:true};
  if(process.env.USE_BUNDLED_CHROMIUM){const bin=require('@sparticuz/chromium').default;options.executablePath=await bin.executablePath();options.args=bin.args.filter(arg=>arg!=='--single-process');}
  const browser=await chromium.launch(options),results=[];
  try {
    for(const [width,height] of [[320,740],[360,740],[390,844],[430,932],[600,960],[768,1024],[820,1180],[844,390]]) {
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      await page.goto(base);await page.waitForSelector('[data-touch-hero] canvas');await page.evaluate(()=>document.fonts.ready);await pause(800);
      const hero=page.locator('[data-touch-hero]'),initialFrames=await hero.getAttribute('data-frames');
      await pause(300);assert.equal(await hero.getAttribute('data-frames'),initialFrames,'resting Hero must not render');assert.equal(await hero.getAttribute('data-running'),'false');
      const box=await hero.locator('canvas').boundingBox(),x=box.x+box.width*.5,y=Math.min(height-100,box.y+box.height*.5);
      // Landscape copy/buttons can cover the centre; use an uncovered portion of the actual sphere canvas.
      const point=await page.evaluate(({x,y,height})=>{
        for(const p of [{x,y},{x:24,y:height*.5},{x:innerWidth-24,y:height*.5}]) if(document.elementFromPoint(p.x,p.y)?.tagName==='CANVAS')return p;
        return null;
      },{x,y,height});
      let releaseMs=null;
      if(point){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await page.waitForFunction(()=>document.querySelector('[data-touch-hero]').dataset.running==='true');await pause(150);
        await page.evaluate(()=>{
          window.__heroRelease={};const h=document.querySelector('[data-touch-hero]');
          const observer=new MutationObserver(()=>{if(h.dataset.running==='false'){window.__heroRelease.elapsed=performance.now()-window.__heroRelease.start;observer.disconnect();}});
          h.querySelector('canvas').addEventListener('pointerup',()=>{window.__heroRelease.start=performance.now();observer.observe(h,{attributes:true,attributeFilter:['data-running']});},{once:true});
        });
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>document.querySelector('[data-touch-hero]').dataset.running==='false',null,{timeout:2000});releaseMs=await page.evaluate(()=>window.__heroRelease.elapsed);
        const frames=await hero.getAttribute('data-frames');await pause(250);assert.equal(await hero.getAttribute('data-frames'),frames,'settled Hero must stop its loop');}
      assert.equal(await page.locator('#work').count(),0,'Case Studies must not mount');
      await page.locator('#services').scrollIntoViewIfNeeded();await pause(1000);
      const stage=page.locator('.mobile-services-stage'),track=page.locator('.mobile-services-track');
      assert.equal(await stage.evaluate(e=>e.classList.contains('is-stacked')),width<340);
      const waitStep=async i=>{await page.waitForFunction(i=>{const s=document.querySelector('.mobile-services-stage'),t=document.querySelector('.mobile-services-track');return +s.dataset.activeStep===i && Math.abs(t.scrollLeft-i*t.getBoundingClientRect().width)<3;},i,{timeout:12000});await pause(650);};
      const fits=[];
      for(let i=0;i<4;i++){
        await page.getByRole('button',{name:`Show ${['UI/UX Design','Web Development','Web Designing','AI Agents'][i]}`,exact:true}).click();await waitStep(i);
        const fit=await page.evaluate(i=>{const s=document.querySelector('.mobile-services-stage'),cards=s.querySelectorAll('.mobile-service-card'),card=cards[i],inner=card.firstElementChild,r=card.getBoundingClientRect(),shape=s.querySelector('.mobile-services-shape').getBoundingClientRect();return {bottom:r.bottom,contentBottom:Math.max(...[...card.querySelectorAll('li,.mobile-tool')].map(e=>e.getBoundingClientRect().bottom)),innerOverflow:inner.scrollHeight-inner.clientHeight,overflow:document.documentElement.scrollWidth-innerWidth,cardX:r.x,shapeRight:shape.right,scale:inner.style.transform,activeCount:[...cards].filter(e=>e.getAttribute('aria-hidden')==='false').length,linkTab:card.querySelector('a').tabIndex};},i);
        assert.equal(fit.overflow,0);assert.ok(fit.bottom<=height+1,`${width}: card bottom`);assert.ok(fit.contentBottom<=fit.bottom+1,`${width}: content fit`);assert.equal(fit.innerOverflow,0);assert.equal(fit.activeCount,1);assert.equal(fit.linkTab,0);
        if(width>=340)assert.ok(fit.cardX>=fit.shapeRight,`${width}: side layout`);fits.push(fit);
      }
      await page.getByRole('button',{name:'Show UI/UX Design',exact:true}).click();await waitStep(0);
      const swipe=async direction=>{const r=await track.boundingBox(),sx=r.x+r.width*(direction==='left'?.88:.12),ex=r.x+r.width*(direction==='left'?.12:.88),y=r.y+Math.min(110,r.height*.3);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y}]});
        for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx+(ex-sx)*i/8,y}]});await pause(25);}
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
      await swipe('left');await waitStep(1);await swipe('left');await waitStep(2);await swipe('right');await waitStep(1);
      await track.focus();await page.keyboard.press('ArrowRight');await waitStep(2);
      await page.getByRole('button',{name:'Previous service',exact:true}).click();await waitStep(1);
      // Vertical page seek still owns the index after the horizontal/control lock expires.
      const start=await stage.evaluate(e=>scrollY+e.parentElement.getBoundingClientRect().top-document.querySelector('[data-site-navbar] > div:first-child').getBoundingClientRect().height);
      await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),start + height*3.2*.96);await waitStep(3);
      await page.getByRole('region',{name:'Core Technology Stack'}).scrollIntoViewIfNeeded();await pause(300);
      const ticker=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,labels:[...document.querySelectorAll('.technology-tool-name')].map(e=>getComputedStyle(e).display),pills:[...document.querySelectorAll('.technology-pill')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,overflow:e.scrollWidth-e.clientWidth,name:e.getAttribute('aria-label')}))}));
      assert.equal(ticker.overflow,0);assert.ok(ticker.pills.every(p=>p.overflow===0 && p.name));if(width<640){assert.ok(ticker.labels.every(d=>d==='none'));assert.ok(ticker.pills.every(p=>Math.abs(p.w-44)<.05&&Math.abs(p.h-44)<.05));}
      await page.getByRole('button',{name:/open.*menu/i}).click();
      const accordion=page.locator('#mobile-services-accordion');if(!await accordion.count())await page.getByRole('button',{name:/Services/}).click();
      const rows=await accordion.locator('a').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().height));assert.equal(rows.length,4);assert.ok(rows.every(h=>h>=44));await page.keyboard.press('Escape');
      assert.deepEqual(errors,[]);results.push({width,height,releaseMs,fits,consoleErrors:errors.length});console.log(`PASS ${width}x${height}: Hero rest/release ${releaseMs}ms; gate; 4 cards; native swipes/reverse; keys; vertical sync; icons; drawer`);await page.close();
    }
    console.log(JSON.stringify(results,null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
