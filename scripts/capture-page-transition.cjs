// Capture compositor frames without serial screenshot encoding blocking the click loop.
const {chromium}=require('playwright');const Chromium=require('@sparticuz/chromium').default;
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:await Chromium.executablePath(),args:Chromium.args.filter(a=>a!=='--single-process')});
 try{
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto((process.env.BASE_URL||'http://127.0.0.1:3000')+'/company');await p.waitForFunction(()=>Boolean(document.documentElement.dataset.pageTransition));await p.waitForTimeout(1500);
  const s=await p.context().newCDPSession(p);const dir='/home/user/page-transition-qa/screencast';fs.mkdirSync(dir,{recursive:true});
  const records=[];
  s.on('Page.screencastFrame',event=>{const i=records.length;records.push({index:i,...event.metadata});fs.writeFileSync(`${dir}/${String(i).padStart(3,'0')}.jpg`,Buffer.from(event.data,'base64'));void s.send('Page.screencastFrameAck',{sessionId:event.sessionId});});
  await s.send('Page.startScreencast',{format:'jpeg',quality:80,maxWidth:960,maxHeight:600,everyNthFrame:1});
  await p.locator('nav[aria-label="Primary Navigation"] a[href="/work"]').click();
  await p.waitForURL('**/work');await p.waitForFunction(()=>document.documentElement.dataset.pageTransition==='idle',null,{timeout:12000});
  await s.send('Page.stopScreencast');fs.writeFileSync(`${dir}/metadata.json`,JSON.stringify(records,null,2));console.log('Captured compositor frames:',records.length);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
