// timer-worker.js
let timeoutId = null;
let startTime = null;
let expected = 0;

self.onmessage = function(e) {
  if (e.data === 'start') {
    startTime = Date.now();
    expected = startTime + 1000;
    
    function driftCorrection() {
      const drift = Date.now() - expected; // Cuánto nos desviamos
      expected += 1000;
      self.postMessage('tick');
      
      // Ajustar el próximo tick para compensar el drift
      timeoutId = setTimeout(driftCorrection, Math.max(0, 1000 - drift));
    }
    
    driftCorrection();
    
  } else if (e.data === 'stop') {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      startTime = null;
      expected = 0;
    }
  }
};