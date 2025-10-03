import './App.css';
import { useState } from 'react'; // ✅ Importamos useState

function App() {
  //agrego 3 lineas nuevas
  const [timeLeft, setTimeLeft] = useState(25 * 60); // sin tiempo no hay pomodoro
  const [intervalId, setIntervalId] = useState(null); // para guardar el ID del intervalo
  const startTimer = () => {
    // Lógica para iniciar el temporizador

    const id = setInterval(() => {
      // Decrementa el tiempo restante cada segundo
      setTimeLeft(prevTime => prevTime - 1);
  }, 1000);
  setIntervalId(id); // Guardamos el Id del intervalo
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
      <p>RPG de Pomodoros</p>  {/* ✅ Nuestra descripción */}
    
       <h2>Tiempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h2>

    <div>
      <button onClick={startTimer}>Iniciar</button> 
      <button onClick={pauseTimer}>Pausar</button> 
      </div></div>
  );

  // fin de las 3 lineas nuevas
}

export default App;
