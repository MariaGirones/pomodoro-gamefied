import './App.css';
import { useState, useEffect } from 'react';

// sacar audio fuera del componente para que no se recargue cada vez
let audio = null;

const preloadAudio = () => {
  if (!audio) {
    audio = new Audio(process.env.PUBLIC_URL + '/endOfPomodoro.wav');
    audio.load();
  }
};
// code starts here

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [intervalId, setIntervalId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [worker, setWorker] = useState(null);
   const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [durations, setDurations] = useState({
    focus: 25 * 60,    // 25 minutes in seconds
    break: 5 * 60      // 5 minutes in seconds
  });

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `🍅 ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  useEffect(() => {
  const timerWorker = new Worker(`${process.env.PUBLIC_URL}/timer-worker.js`);
  setWorker(timerWorker);
  
  return () => {
    timerWorker.terminate();
  };
}, []);

 useEffect(() => {
  if (!worker) return;

  worker.onmessage = (event) => {
    if (event.data === 'tick') {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          console.log('🔄 Cambiando modo de:', mode);
          worker.postMessage('stop');
          setIntervalId(null);
          playSound();
          showNotification();
          
          // 🆕 PREVENIR MÚLTIPLES EJECUCIONES
          if (prevTime === 0) return 0;
          
          if (mode === 'focus') {
            setMode('break');
            return durations.break;
          } else {
            setMode('focus');
            return durations.focus;
          }
        }
        return prevTime - 1;
      });
    }
  };
}, [worker, mode, durations]); // Solo se ejecuta cuando 'worker' cambia

  // play sound function
  const playSound = () => {
    if (!audio) {
      preloadAudio();
    }
    audio.currentTime = 0;
    audio.play().catch(e => {
      console.log('Audio no pudo reproducirse:', e);
    });
  };

  const showNotification = () => { 
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {
      new Notification("🍅 Time's up! Take a break or start a new session. Great job btw!");
    }
  };

  const startTimer = () => {
  if (worker) {
    setTimeLeft(durations[mode]);  // 🎯 TIEMPO DEL MODO ACTUAL
    worker.postMessage('start');
    setIntervalId(true);
  }
};
  
  const pauseTimer = () => {
  if (worker && intervalId) {
    worker.postMessage('stop'); // 🆕 Decirle al Worker que se detenga
    setIntervalId(null);
  }
};

  const restartTimer = () => {
  if (worker && intervalId) {
    worker.postMessage('stop'); // 🆕 Detener Worker si está corriendo
  }
  setIntervalId(null);
  setTimeLeft(25 * 60);
};

  return (
    <>
      {showWelcome && (
        <div className="welcome-modal">
          <div className="modal-content">
            <h3>🍅 ¡Welcome!</h3>
            <p><strong>Keep in mind:</strong></p>
            <ul>
              <li>🔔 <strong>Notifications:</strong> Always visible, even with inactive tab</li>
              <li>🎵 <strong>Sound:</strong> Works when this tab is active</li>
              <li>⏱️ <strong>Timer:</strong> Maximum precision with active tab</li>
            </ul>
            <button 
              className="got-it-btn"
              onClick={() => setShowWelcome(false)}
            >
              ¡Ok, START!
            </button>
          </div>
        </div>
      )}
      
      <div className="App">
        <h1>🍅 NeuroStudy Quest</h1>
        <p>Focus in 25-minute bursts. Build momentum. Build consistency. Build success.</p>
       <h2>{mode === 'focus' ? '🍅 Focus Time' : '☕ Break Time'}: 
           {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
       </h2>
        <div>
          <button onClick={startTimer}>Start</button> 
          <button onClick={pauseTimer}>Pause</button> 
           <button onClick={restartTimer}>Restart</button>
        </div>
      </div>
    </>
  );
}

export default App;