import './App.css';
import { useState, useEffect, useRef } from 'react';

// Audio is created outside the component so it is never recreated on re-render
let audio = null;

const preloadAudio = () => {
  if (!audio) {
    audio = new Audio(process.env.PUBLIC_URL + '/endOfPomodoro.wav');
    audio.load();
  }
};

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [worker, setWorker] = useState(null);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [durations] = useState({
    focus: 25 * 60,
    break: 5 * 60,
  });

  // Refs let the worker onmessage handler always read the latest values
  // without needing to re-register the handler on every mode/durations change
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);
  useEffect(() => { modeRef.current = mode; }, [mode]);

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
            worker.postMessage('stop');
            setIsRunning(false);
            playSound();
            showNotification();

            // Guard against double-firing if state was already at 0
            if (prevTime === 0) return 0;

            if (modeRef.current === 'focus') {
              setMode('break');
              return durationsRef.current.break;
            } else {
              setMode('focus');
              return durationsRef.current.focus;
            }
          }
          return prevTime - 1;
        });
      }
    };
  }, [worker]); // Only re-register when the worker instance changes

  const playSound = () => {
    if (!audio) preloadAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Audio playback can be blocked by the browser before a user gesture
    });
  };

  const showNotification = () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification("🍅 Time's up! Take a break or start a new session. Great job!");
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Start resumes from wherever the timer is paused; it does not reset
  const startTimer = () => {
    if (worker && !isRunning) {
      worker.postMessage('start');
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    if (worker && isRunning) {
      worker.postMessage('stop');
      setIsRunning(false);
    }
  };

  // Restart stops the timer and resets to the full duration of the current mode
  const restartTimer = () => {
    if (worker && isRunning) {
      worker.postMessage('stop');
    }
    setIsRunning(false);
    setTimeLeft(durations[mode]);
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
              onClick={() => { requestNotificationPermission(); setShowWelcome(false); }}
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