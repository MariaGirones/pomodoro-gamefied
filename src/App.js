//all imports
import './App.css';
import { useState, useEffect } from 'react'; // ✅ Importamos useState y useEffect

function App() {
  //agrego 3 lineas nuevas
  const [timeLeft, setTimeLeft] = useState(25 * 60); // sin tiempo no hay pomodoro
  const [intervalId, setIntervalId] = useState(null); // para guardar el ID del intervalo

useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `🍅 ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

 const startTimer = () => {
 const id = setInterval(() => {
    setTimeLeft(prevTime => {
      if (prevTime <= 1) {
        return 0;  // 🛑 Se detiene aquí por ahora
      }
      return prevTime - 1;  // ✅ Sigue restando normalmente
    });
  }, 1000);
  setIntervalId(id);
};
  
  const pauseTimer = () => {
    // Lógica para pausar el temporizador
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null); // Limpiamos el ID del intervalo
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
