const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ratioFunction = html.match(/function graphicsPixelRatio\(\)\{[\s\S]*?\n\}/)[0];
const loopFunction = html.match(/^function loop\(time\).*$/m)[0];

test('render pixel budget scales with viewport size and respects device pixel ratio', () => {
  const context = vm.createContext({ quality: 'low', innerWidth: 3840, innerHeight: 2160, window: { devicePixelRatio: 2 } });
  vm.runInContext(ratioFunction, context);
  let ratio = vm.runInContext('graphicsPixelRatio()', context);
  assert.ok(3840 * 2160 * ratio * ratio <= 1280 * 720 + 1);
  context.quality = 'high';
  ratio = vm.runInContext('graphicsPixelRatio()', context);
  assert.ok(3840 * 2160 * ratio * ratio <= 1920 * 1080 + 1);
  context.innerWidth = 640; context.innerHeight = 480; context.window.devicePixelRatio = 0.75;
  assert.equal(vm.runInContext('graphicsPixelRatio()', context), 0.75);
});

test('paused scene renders once, then stays idle; invalidation redraws once', () => {
  let frames = 0;
  const context = vm.createContext({ requestAnimationFrame() {}, document: { hidden: false }, playing: true,
    renderer: { render() { frames++; } }, player: {}, scene: {}, camera: {}, storyPaused: true,
    lastFrameTime: 10, pausedFrameRendered: false });
  vm.runInContext(loopFunction, context);
  for (let time = 16; time < 4000; time += 16) context.loop(time);
  assert.equal(frames, 1);
  assert.equal(context.lastFrameTime, 0);
  context.pausedFrameRendered = false;
  context.loop(4000); context.loop(4016);
  assert.equal(frames, 2);
  context.document.hidden = true;
  context.loop(4032);
  assert.equal(frames, 2);
  context.document.hidden = false;
  context.loop(4048);
  assert.equal(frames, 3);
});
