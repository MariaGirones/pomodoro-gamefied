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

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    preloadAudio(); // Preload audio on component mount
  }, []);

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
    const id = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(id);
          setIntervalId(null);
          playSound();
          showNotification();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(id);
  };
  
  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
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
        <h2>Tiempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h2>
        <div>
          <button onClick={startTimer}>Iniciar</button> 
          <button onClick={pauseTimer}>Pausar</button> 
        </div>
      </div>
    </>
  );
}

export default App;