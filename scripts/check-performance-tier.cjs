const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/lib/performanceTier.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function load(width, coarse, cores=8, memory=8, saveData=false) {
 const box = {exports:{}, navigator:{hardwareConcurrency:cores,deviceMemory:memory,connection:{saveData}}, window:{innerWidth:width,matchMedia:()=>({matches:coarse})}};
 vm.runInNewContext(code,box); return box.exports;
}
assert.equal(load(1440,false).getPerformanceTier().tier,'high');
for(const w of [320,360,375,390,412,430,600,768,820]) {
 assert.equal(load(w,true).getPerformanceTier().tier,'medium');
 assert.equal(load(w,true,4).getPerformanceTier().tier,'low');
 assert.equal(load(w,true,8,4).getPerformanceTier().tier,'low');
}
assert.equal(load(1440,false,8,8,true).getPerformanceTier().tier,'low');
let changes=[]; const m=load(390,true).createAdaptiveFpsMonitor('high',t=>changes.push(t.tier));
for(let i=0;i<60;i++)m.recordFrame(1/30,i*1000/30);
assert.deepEqual(changes,['medium']);
for(let i=60;i<100;i++)m.recordFrame(1/30,i*1000/30);
assert.deepEqual(changes,['medium']);
for(let i=0;i<60;i++)m.recordFrame(1/30,15000+i*1000/30);
assert.deepEqual(changes,['medium','low']);
console.log('PASS: tier selection, Save-Data, sustained FPS downgrade, cooldown, low-tier floor');
