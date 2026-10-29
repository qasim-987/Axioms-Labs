const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function run(source) {
  const box={exports:{},Intl,Float32Array};
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,box);
  return box.exports;
}
const config=run(fs.readFileSync('src/config/pricing.ts','utf8'));
assert.equal(config.pricing.currency,'USD');
assert.equal(config.pricing.budgetBands.length,6);
assert.equal(config.pricing.copy.showConsultation,false);
for(const [slug,min,max] of [['ui-ux-design',300,1500],['web-designing',250,1200],['web-development',600,3500],['ai-agents',800,5000]]) {
  const rate=config.getServicePricing(slug);
  assert.equal(rate.startingPrice,min);assert.equal(rate.typicalRange[0],min);assert.equal(rate.typicalRange[1],max);
  assert.ok(config.startingPriceText(slug).startsWith('Starting from $'));
}
assert.equal(config.getServicePricing('web-development').customAppStartingPrice,2000);
assert.ok(config.pricing.budgetBands.includes(config.DEFAULT_BUDGET));
for(const file of ['src/components/ContactSection.tsx','src/components/ServiceDetailClient.tsx','src/app/contact/page.tsx']) {
  const text=fs.readFileSync(file,'utf8');
  assert.ok(text.includes('pricing.budgetBands') || text.includes('budgetRanges = pricing.budgetBands'));
  assert.ok(!text.includes('$15,000') && !text.includes('$2,500'));
}
function fn(file,name) {
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  return source.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name).getText(source);
}
const shapes=['wireframe','brackets','growthChart','dnaHelix'];
const evaluate=run(`const ORDERED_SERVICE_SHAPES=${JSON.stringify(shapes)};${fn('src/components/ServicesParticleCanvas.tsx','evaluateServicesMasterTimeline')}`).evaluateServicesMasterTimeline;
const drag=run(`const STEP_HOLD_PROGRESS=[.075,.385,.695,.96];const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));${fn('src/components/MobileServices.tsx','mobileDragProgress')}`).mobileDragProgress;
for(let step=0;step<3;step++)for(let k=1;k<100;k++) {
  const fraction=k/100,state=evaluate(drag(step+fraction));
  assert.equal(state.fromShape,shapes[step]);assert.equal(state.toShape,shapes[step+1]);
  assert.ok(Math.abs(state.shapeMorphT-fraction)<1e-6);
}
for(let i=0;i<4;i++)assert.equal(evaluate(drag(i)).scrollIndex,i);
console.log('PASS: owner launch pricing, all six centralized budgets, disabled unconfirmed free offer, fractional swipe morph windows');
