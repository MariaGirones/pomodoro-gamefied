import './App.css';
import { useState, useEffect, useRef } from 'react';
import PetDisplay from './PetDisplay';
import PetPicker from './PetPicker';
import { MAX_XP } from './pets';

// ── Audio singleton ───────────────────────────────────────────────────────────
let audio = null;
function preloadAudio() {
  if (!audio) {
    audio = new Audio(process.env.PUBLIC_URL + '/endOfPomodoro.wav');
    audio.load();
  }
}

// ── Timer constants ───────────────────────────────────────────────────────────
const SHORT_BREAK_SECS = 5 * 60;
const LONG_BREAK_SECS  = 15 * 60;
const CYCLE_LENGTH     = 4;

function getDuration(mode, workSecs) {
  if (mode === 'work') return workSecs;
  if (mode === 'shortBreak') return SHORT_BREAK_SECS;
  return LONG_BREAK_SECS;
}

function nextSession(mode, count) {
  if (mode === 'work') {
    if (count >= CYCLE_LENGTH) return { nextMode: 'longBreak', nextCount: count };
    return { nextMode: 'shortBreak', nextCount: count };
  }
  const nextCount = mode === 'longBreak' ? 1 : count + 1;
  return { nextMode: 'work', nextCount };
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_XP    = 'nsq_xp';
const LS_PET   = 'nsq_pet';
const LS_DARK  = 'nsq_dark';
const LS_WORK  = 'nsq_work';
const LS_COUNT = 'nsq_count';
const LS_MODE  = 'nsq_mode';

const VALID_MODES = new Set(['work', 'shortBreak', 'longBreak']);

function loadXP() {
  const raw = parseInt(localStorage.getItem(LS_XP), 10);
  return isNaN(raw) ? 0 : Math.min(MAX_XP, Math.max(0, raw));
}

function loadPetId() {
  return localStorage.getItem(LS_PET) ?? 'cat';
}

function loadDarkMode() {
  return localStorage.getItem(LS_DARK) !== 'false'; // default: dark
}

function loadWorkMinutes() {
  const raw = parseInt(localStorage.getItem(LS_WORK), 10);
  return isNaN(raw) ? 25 : Math.min(90, Math.max(1, raw));
}

function loadPomodoroCount() {
  const raw = parseInt(localStorage.getItem(LS_COUNT), 10);
  return isNaN(raw) ? 1 : Math.min(CYCLE_LENGTH, Math.max(1, raw));
}

function loadMode() {
  const raw = localStorage.getItem(LS_MODE);
  return VALID_MODES.has(raw) ? raw : 'work';
}

// ── Component ─────────────────────────────────────────────────────────────────
function App() {
  // Timer state
  const [workMinutes, setWorkMinutes]     = useState(loadWorkMinutes);
  const [pomodoroCount, setPomodoroCount] = useState(loadPomodoroCount);
  const [mode, setMode]                   = useState(loadMode);
  const [timeLeft, setTimeLeft]           = useState(() => getDuration(loadMode(), loadWorkMinutes() * 60));
  const [isRunning, setIsRunning]         = useState(false);
  const [worker, setWorker]               = useState(null);
  const [alerting, setAlerting]           = useState(false);

  // Pet & XP state (persisted)
  const [xp, setXP]                     = useState(loadXP);
  const [chosenPetId, setChosenPetId]   = useState(loadPetId);
  const [xpGainCount, setXpGainCount]   = useState(0); // drives bounce animation

  // UI state
  const isFirstVisitRef               = useRef(localStorage.getItem(LS_PET) === null);
  const [showPicker, setShowPicker]   = useState(() => localStorage.getItem(LS_PET) === null);
  const [pendingPetId, setPendingPetId] = useState(null);
  const [showXpWarning, setShowXpWarning] = useState(false);
  const [darkMode, setDarkMode]         = useState(loadDarkMode);

  // Refs — values readable inside async contexts without stale closures
  const modeRef          = useRef(loadMode());
  const pomodoroCountRef = useRef(loadPomodoroCount());
  const workSecsRef      = useRef(loadWorkMinutes() * 60);
  const isRunningRef     = useRef(false);
  const workerRef        = useRef(null);
  const xpRef            = useRef(loadXP());

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
  useEffect(() => { workSecsRef.current = workMinutes * 60; }, [workMinutes]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { xpRef.current = xp; }, [xp]);

  // Persist all user data to localStorage
  useEffect(() => { localStorage.setItem(LS_XP,    xp);            }, [xp]);
  useEffect(() => { localStorage.setItem(LS_PET,   chosenPetId);   }, [chosenPetId]);
  useEffect(() => { localStorage.setItem(LS_WORK,  workMinutes);   }, [workMinutes]);
  useEffect(() => { localStorage.setItem(LS_COUNT, pomodoroCount); }, [pomodoroCount]);
  useEffect(() => { localStorage.setItem(LS_MODE,  mode);          }, [mode]);

  // Apply theme and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(LS_DARK, darkMode);
  }, [darkMode]);

  // Browser tab title
  useEffect(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.title = `🍅 PomoSprite ${m}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Create the worker once
  useEffect(() => {
    const timerWorker = new Worker(`${process.env.PUBLIC_URL}/timer-worker.js`);
    workerRef.current = timerWorker;
    setWorker(timerWorker);
    return () => timerWorker.terminate();
  }, []);

  // Wire up the tick handler — re-registers only when the worker instance changes
  useEffect(() => {
    if (!worker) return;
    worker.onmessage = (event) => {
      if (event.data !== 'tick') return;
      setTimeLeft(prev => Math.max(0, prev - 1));
    };
  }, [worker]);

  // ── Session-end effect ────────────────────────────────────────────────────
  // Fires when timeLeft reaches 0 while the timer is running.
  // All side-effects live here — not inside the setState updater.
  useEffect(() => {
    if (timeLeft !== 0 || !isRunningRef.current) return;

    workerRef.current?.postMessage('stop');
    isRunningRef.current = false;
    setIsRunning(false);

    // Flash alert
    setAlerting(true);
    setTimeout(() => setAlerting(false), 1500);

    // Sound
    preloadAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});

    // Desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const labels = {
        work:       '🍅 Work session done! Time for a break.',
        shortBreak: '☕ Break over — back to work!',
        longBreak:  '🛋️ Long break over — new cycle starts!',
      };
      new Notification(labels[modeRef.current] ?? "🍅 Time's up!");
    }

    // ── Award XP for completed work sessions ──────────────────────────────
    if (modeRef.current === 'work') {
      const earned = Math.floor(workSecsRef.current / 60); // 1 XP per full minute
      const newXP  = Math.min(MAX_XP, xpRef.current + earned);
      xpRef.current = newXP;
      setXP(newXP);
      setXpGainCount(c => c + 1); // triggers pet bounce animation
    }

    // ── Advance session ───────────────────────────────────────────────────
    const { nextMode, nextCount } = nextSession(modeRef.current, pomodoroCountRef.current);
    modeRef.current          = nextMode;
    pomodoroCountRef.current = nextCount;
    setMode(nextMode);
    setPomodoroCount(nextCount);
    setTimeLeft(getDuration(nextMode, workSecsRef.current));
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const openPetPicker = () => {
    setPendingPetId(null);
    setShowPicker(true);
  };

  const handlePickerConfirm = () => {
    const targetPet = pendingPetId ?? chosenPetId;
    if (isFirstVisitRef.current || targetPet === chosenPetId) {
      if (isFirstVisitRef.current) requestNotificationPermission();
      isFirstVisitRef.current = false;
      setChosenPetId(targetPet);
      setShowPicker(false);
      setPendingPetId(null);
    } else {
      // Switching to a different pet — warn about XP reset
      setShowXpWarning(true);
    }
  };

  const handleXpResetConfirm = () => {
    setChosenPetId(pendingPetId);
    setXP(0);
    xpRef.current = 0;
    isFirstVisitRef.current = false;
    setShowXpWarning(false);
    setShowPicker(false);
    setPendingPetId(null);
  };

  const handlePickerCancel = () => {
    setShowXpWarning(false);
    setShowPicker(false);
    setPendingPetId(null);
  };

  const handleWorkMinutesChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const val = Math.min(90, Math.max(1, isNaN(raw) ? 1 : raw));
    setWorkMinutes(val);
    workSecsRef.current = val * 60;
    if (!isRunningRef.current && modeRef.current === 'work') {
      setTimeLeft(val * 60);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────

  const completedInCycle =
    mode === 'work'      ? pomodoroCount - 1 :
    mode === 'longBreak' ? CYCLE_LENGTH :
    /* shortBreak */       pomodoroCount;

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
      {/* ── Pet picker modal (onboarding + change) ── */}
      {showPicker && (
        <div className="welcome-modal">
          <div className="modal-content modal-wide">
            {isFirstVisitRef.current ? (
              <>
                <h3>🍅 Choose your companion</h3>
                <p className="modal-sub">
                  It grows as you earn XP from focus sessions.
                </p>
              </>
            ) : (
              <>
                <h3>🐾 Change companion</h3>
                <p className="modal-sub">
                  Switching to a new companion will reset your XP to 0.
                </p>
              </>
            )}

            <PetPicker
              currentPetId={pendingPetId ?? chosenPetId}
              onSelect={setPendingPetId}
            />

            <button className="got-it-btn" onClick={handlePickerConfirm}>
              {isFirstVisitRef.current ? "Let's go!" : 'Confirm'}
            </button>

            {!isFirstVisitRef.current && (
              <button className="picker-cancel-btn" onClick={handlePickerCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── XP reset confirmation ── */}
      {showXpWarning && (
        <div className="welcome-modal">
          <div className="modal-content modal-narrow">
            <h3>⚠ Reset XP?</h3>
            <div className="xp-warning-box">
              <p>Switching companions will reset your XP to&nbsp;0.</p>
              <p>This cannot be undone.</p>
            </div>
            <button
              className="got-it-btn got-it-btn--danger"
              onClick={handleXpResetConfirm}
            >
              Yes, switch &amp; reset
            </button>
            <button
              className="picker-cancel-btn"
              onClick={() => setShowXpWarning(false)}
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* ── Main app ── */}
      <div className={`App mode-${mode}${alerting ? ' alerting' : ''}`}>
        <div className="top-bar">
          <h1>🍅 PomoSprite</h1>
          <div className="top-bar-actions">
            <button
              className="settings-btn"
              onClick={openPetPicker}
              aria-label="Change companion"
              title="Change companion"
            >
              🐾
            </button>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(d => !d)}
              aria-label="Toggle light/dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Pet + XP */}
        <PetDisplay petId={chosenPetId} xp={xp} gainCount={xpGainCount} isRunning={isRunning} />

        <hr className="divider" />

        {/* Timer */}
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
                i < completedInCycle                       ? 'done'   : '',
                i === pomodoroCount - 1 && mode === 'work' ? 'active' : '',
              ].filter(Boolean).join(' ')}
              aria-label={`Pomodoro ${i + 1}`}
            >🍅</span>
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
