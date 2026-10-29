// No browser/dependency changes needed: use the project's TypeScript transpiler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = {exports: {}};
  cache.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX}
  }).outputText;
  const localRequire = name => {
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(file), name);
      return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
    }
    return require(name);
  };
  vm.runInNewContext(code, {module, exports: module.exports, require: localRequire, console, Float32Array, Math}, {filename: file});
  return module.exports;
}
const {evaluateServicesMasterTimeline: evaluate, MORPH_DISPERSAL, ENTRY_ASSEMBLE_MS, STEP_HOLD_PROGRESS} = load('src/components/ServicesParticleCanvas.tsx');
assert.equal(MORPH_DISPERSAL, .35);
assert.equal(ENTRY_ASSEMBLE_MS, 900);
const expected = ['wireframe', 'brackets', 'growthChart', 'dnaHelix'];
for (let i = 0; i <= 1000; i++) {
  const progress = i / 1000;
  assert.deepEqual(evaluate(progress), evaluate(progress));
  for (const shape of [evaluate(progress).fromShape, evaluate(progress).toShape]) assert.ok(expected.includes(shape));
}
for (let i = 0; i < 4; i++) {
  const state = evaluate(STEP_HOLD_PROGRESS[i]);
  assert.equal(state.scrollIndex, i);
  // A seek target must land on a hold, not on an invisible-content midpoint.
  assert.equal(state.fromShape, expected[i]);
  assert.equal(state.toShape, expected[i]);
}
for (const progress of [1, .7, .4, .1, 0]) assert.ok(expected.includes(evaluate(progress).fromShape));
assert.equal(evaluate(0).fromShape, 'wireframe');
assert.equal(evaluate(0).toShape, 'wireframe');
const shapes = load('src/lib/serviceParticleShapes.ts').buildAllServiceShapes(2160);
assert.equal(Object.keys(shapes).length, 4);
for (const points of Object.values(shapes)) {
  assert.equal(points.length, 2160 * 3);
  assert.ok(points.every(Number.isFinite));
}
console.log('PASS: sphere-free timeline, reverse entry, four shape buffers, dispersal/entry constants, seek targets');
