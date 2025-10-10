import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [intervalId, setIntervalId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `🍅 ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const playSound = () => {
    const audio = new Audio(process.env.PUBLIC_URL + '/endOfPomodoro.wav');
    audio.play();
  };

  const startTimer = () => {
    const id = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(id);
          setIntervalId(null);
          playSound();
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
            <h3>🎯 ¡Welcome!</h3>
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
