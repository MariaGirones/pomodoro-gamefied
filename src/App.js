import './App.css';
import { useState } from 'react'; // ✅ Importamos useState

function App() {
  //agrego 3 lineas nuevas
  const [timeLeft, setTimeLeft] = useState(25 * 60); // sin tiempo no hay pomodoro
  
  const startTimer = () => {
    // Lógica para iniciar el temporizador
  };
  return (
    <div className="App">
       <h1>🍅 NeuroStudy Quest</h1>  {/* ✅ Nuestro título personalizado */}
      <p>Tu RPG de Pomodoros</p>  {/* ✅ Nuestra descripción */}
    </div>
  );

  // fin de las 3 lineas nuevas
}

export default App;
