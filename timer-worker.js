// timer-worker.js
let intervalId = null;

self.onmessage = function(e) {
  if (e.data === 'start') {
    // Iniciar temporizador
    intervalId = setInterval(() => {
      self.postMessage('tick');
    }, 1000);
  } else if (e.data === 'stop') {
    // Detener temporizador
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};