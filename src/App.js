import './App.css';
import { useState, useEffect, useRef } from 'react';

// Audio singleton — created once, never re-created on re-render
let audio = null;
function preloadAudio() {
  if (!audio) {
    audio = new Audio(process.env.PUBLIC_URL + '/endOfPomodoro.wav');
    audio.load();
  }
}

const SHORT_BREAK_SECS = 5 * 60;
const LONG_BREAK_SECS = 15 * 60;
const CYCLE_LENGTH = 4;

function getDuration(mode, workSecs) {
  if (mode === 'work') return workSecs;
  if (mode === 'shortBreak') return SHORT_BREAK_SECS;
  return LONG_BREAK_SECS;
}

// Returns the mode and pomodoro count for the session that follows the current one
function nextSession(mode, count) {
  if (mode === 'work') {
    if (count >= CYCLE_LENGTH) return { nextMode: 'longBreak', nextCount: count };
    return { nextMode: 'shortBreak', nextCount: count };
  }
  // Break ended → back to work
  const nextCount = mode === 'longBreak' ? 1 : count + 1;
  return { nextMode: 'work', nextCount };
}

function App() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [pomodoroCount, setPomodoroCount] = useState(1); // 1–CYCLE_LENGTH
  const [mode, setMode] = useState('work');              // 'work' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [worker, setWorker] = useState(null);
  const [alerting, setAlerting] = useState(false);

  // Refs for values that need to be read inside async contexts (worker callbacks,
  // effects) without adding them to dependency arrays and without stale closures.
  const modeRef = useRef('work');
  const pomodoroCountRef = useRef(1);
  const workSecsRef = useRef(25 * 60);
  const isRunningRef = useRef(false);
  const workerRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
  useEffect(() => { workSecsRef.current = workMinutes * 60; }, [workMinutes]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Browser tab title
  useEffect(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.title = `🍅 ${m}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Create the worker once on mount
  useEffect(() => {
    const timerWorker = new Worker(`${process.env.PUBLIC_URL}/timer-worker.js`);
    workerRef.current = timerWorker;
    setWorker(timerWorker);
    return () => timerWorker.terminate();
  }, []);

  // Wire up the worker's message handler — only needs to change when the
  // worker instance itself changes (i.e. once).
  useEffect(() => {
    if (!worker) return;
    worker.onmessage = (event) => {
      if (event.data !== 'tick') return;
      setTimeLeft(prev => Math.max(0, prev - 1));
    };
  }, [worker]);

  // Session-end: fires whenever timeLeft reaches 0 while the timer is running.
  // Side effects live here instead of inside the setState updater.
  useEffect(() => {
    if (timeLeft !== 0 || !isRunningRef.current) return;

    // Stop the worker
    workerRef.current?.postMessage('stop');
    isRunningRef.current = false;
    setIsRunning(false);

    // Visual flash alert
    setAlerting(true);
    setTimeout(() => setAlerting(false), 1500);

    // Sound
    preloadAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Blocked before a user gesture — silently ignore
    });

    // Desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const labels = {
        work: "🍅 Work session done! Time for a break.",
        shortBreak: "☕ Break over — back to work!",
        longBreak: "🛋️ Long break over — new cycle starts!",
      };
      new Notification(labels[modeRef.current] ?? "🍅 Time's up!");
    }

    // Advance to the next session
    const { nextMode, nextCount } = nextSession(modeRef.current, pomodoroCountRef.current);
    modeRef.current = nextMode;
    pomodoroCountRef.current = nextCount;
    setMode(nextMode);
    setPomodoroCount(nextCount);
    setTimeLeft(getDuration(nextMode, workSecsRef.current));
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ All other values are accessed via refs — intentional, to avoid re-registering
  //   on every mode/count/duration change while still reading current values.

  // ── Controls ──────────────────────────────────────────────────────────────

  const startTimer = () => {
    if (workerRef.current && !isRunningRef.current) {
      workerRef.current.postMessage('start');
      isRunningRef.current = true;
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    if (workerRef.current && isRunningRef.current) {
      workerRef.current.postMessage('stop');
      isRunningRef.current = false;
      setIsRunning(false);
    }
  };

  // Restart resets time for the current mode without switching modes
  const restartTimer = () => {
    if (isRunningRef.current) {
      workerRef.current?.postMessage('stop');
      isRunningRef.current = false;
      setIsRunning(false);
    }
    setTimeLeft(getDuration(modeRef.current, workSecsRef.current));
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleWorkMinutesChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const val = Math.min(90, Math.max(1, isNaN(raw) ? 1 : raw));
    setWorkMinutes(val);
    workSecsRef.current = val * 60;
    // Live-update the display only when not mid-session
    if (!isRunningRef.current && modeRef.current === 'work') {
      setTimeLeft(val * 60);
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const completedInCycle =
    mode === 'work'       ? pomodoroCount - 1 :
    mode === 'longBreak'  ? CYCLE_LENGTH :
    /* shortBreak */        pomodoroCount;

  const modeLabel =
    mode === 'work'       ? '🍅 Work Session' :
    mode === 'shortBreak' ? '☕ Short Break'  :
                            '🛋️ Long Break';

  const subLabel =
    mode === 'work'
      ? `Pomodoro ${pomodoroCount} / ${CYCLE_LENGTH}`
      : mode === 'shortBreak'
      ? `After pomodoro ${pomodoroCount} / ${CYCLE_LENGTH}`
      : 'Cycle complete — enjoy the rest!';

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {showWelcome && (
        <div className="welcome-modal">
          <div className="modal-content">
            <h3>🍅 Welcome!</h3>
            <p><strong>Good to know:</strong></p>
            <ul>
              <li>🔔 <strong>Notifications</strong> work even with the tab inactive</li>
              <li>🎵 <strong>Sound</strong> plays when the tab is active</li>
              <li>⏱️ <strong>Timer</strong> is drift-corrected — it won't fall behind</li>
            </ul>
            <button
              className="got-it-btn"
              onClick={() => { requestNotificationPermission(); setShowWelcome(false); }}
            >
              Let's go!
            </button>
          </div>
        </div>
      )}

      <div className={`App mode-${mode}${alerting ? ' alerting' : ''}`}>
        <h1>🍅 NeuroStudy Quest</h1>

        <div className="session-info">
          <span className="mode-label">{modeLabel}</span>
          <span className="sub-label">{subLabel}</span>
        </div>

        <div className="timer-display">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        <div className="cycle-dots" aria-label="Pomodoro cycle progress">
          {Array.from({ length: CYCLE_LENGTH }, (_, i) => (
            <span
              key={i}
              className={[
                'dot',
                i < completedInCycle               ? 'done'   : '',
                i === pomodoroCount - 1 && mode === 'work' ? 'active' : '',
              ].filter(Boolean).join(' ')}
              aria-label={`Pomodoro ${i + 1}`}
            />
          ))}
        </div>

        <div className="controls">
          <button className="btn" onClick={startTimer} disabled={isRunning}>
            Start
          </button>
          <button className="btn" onClick={pauseTimer} disabled={!isRunning}>
            Pause
          </button>
          <button className="btn btn-secondary" onClick={restartTimer}>
            Restart
          </button>
        </div>

        <div className="settings">
          <label htmlFor="work-duration">Work duration:</label>
          <input
            id="work-duration"
            type="number"
            min="1"
            max="90"
            value={workMinutes}
            onChange={handleWorkMinutesChange}
            disabled={isRunning && mode === 'work'}
          />
          <span>min</span>
        </div>
      </div>
    </>
  );
}

export default App;
