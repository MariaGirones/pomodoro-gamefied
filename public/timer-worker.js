// Drift-correcting timer worker.
// Each tick fires as close to 1-second boundaries as possible.
let timeoutId = null;
let expected = 0;

function tick() {
  self.postMessage('tick');
  const drift = Date.now() - expected; // how late this tick arrived
  expected += 1000;
  timeoutId = setTimeout(tick, Math.max(0, 1000 - drift));
}

self.onmessage = function (e) {
  if (e.data === 'start') {
    // First tick fires after exactly 1 second, not immediately
    expected = Date.now() + 1000;
    timeoutId = setTimeout(tick, 1000);
  } else if (e.data === 'stop') {
    clearTimeout(timeoutId);
    timeoutId = null;
    expected = 0;
  }
};
