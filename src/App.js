//all imports
import './App.css';
import { useState, useEffect } from 'react'; // ✅ Importamos useState y useEffect

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `🍅 ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const playSound = () => {
    const audio = new Audio('/sounds/endOfPomodoro.mp3');
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
    <div className="App">
       <h1>🍅 NeuroStudy Quest</h1>  {/* ✅ Nuestro título personalizado */}
      <p>Focus in 25-minute bursts. Build momentum. Build consistency. Build success.</p>  {/* ✅ Nuestra descripción */}
    
       <h2>Tiempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h2>

    <div>
      <button onClick={startTimer}>Iniciar</button> 
      <button onClick={pauseTimer}>Pausar</button> 
      </div></div>
  );

  // fin de las 3 lineas nuevas
}

export default App;
