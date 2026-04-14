# 🍅 NeuroStudy Quest

**A gamified Pomodoro timer with pixel art companion pets.**  
*Stay focused. Earn XP. Watch your pet grow.*

## 🚀 Live Demo

**[👉 Try it live here!](https://MariaGirones.github.io/pomodoro-gamefied)**

---

## ✨ Features

- **Pixel art companion pets** — choose from Cat, Dog, Dragon, Bunny, Fox, or Axolotl. Each has 3 evolution stages drawn with canvas-based pixel art sprites.
- **XP & leveling system** — earn 1 XP per minute of focused work. Your pet evolves at 334 XP (mid) and 667 XP (final form), maxing out at 1000 XP.
- **Drift-free Pomodoro timer** — uses a Web Worker with `Date.now()`-based correction so the timer never drifts, even when the tab is in the background.
- **Full Pomodoro cycle** — 4 work sessions → short breaks → long break, with cycle progress dots.
- **Custom work duration** — set any work session length from 1 to 90 minutes.
- **Sound + desktop notifications** — audio alert and browser notification when a session ends.
- **Retro pixel aesthetic** — Press Start 2P font, NES-style XP bar, CRT scanline overlay, neon glow on the timer.
- **Dark / light mode toggle** — persisted across sessions. Light mode uses a pastel retro palette.
- **Full localStorage persistence** — pet, XP, dark mode, work duration, and Pomodoro cycle progress all survive page refresh.
- **Mobile-friendly** — responsive layout down to 320px wide.

---

## 🐾 Pets

| Pet | Baby | Mid | Final |
|---|---|---|---|
| Cat | 🐱 | 🐱 | 🐱 |
| Dog | 🐶 | 🐶 | 🐶 |
| Dragon | 🐲 | 🐲 | 🐲 |
| Bunny | 🐰 | 🐰 | 🐰 |
| Fox | 🦊 | 🦊 | 🦊 |
| Axolotl | 🦎 | 🦎 | 🦎 |

Each sprite is drawn procedurally on an HTML `<canvas>` element — no image files.

---

## 🛠️ Built With

- ⚛️ React 19 (Create React App)
- 🎨 CSS custom properties for theming
- 🖼️ HTML Canvas API for pixel art sprites
- ⏱️ Web Worker for drift-free timer
- 💾 localStorage for persistence
- 📦 GitHub Pages (`gh-pages`) for deployment

---

## 🧠 The Psychology Behind It

As a psychology student, I built this app incorporating:
- **Pomodoro Technique** for sustained focus and managing cognitive load
- **Progression systems** (XP + pet evolution) to build long-term consistency
- **Visual feedback** (glowing timer, cycle dots, pet animation) for immediate motivation
- **Autonomy** via customisable session length

---

## 🗂️ Project Structure

```
src/
  App.js          — main component, timer logic, localStorage persistence
  App.css         — retro theme, dark/light mode, all UI styles
  PetDisplay.js   — XP bar + animated pet canvas
  PetPicker.js    — pet selection modal grid
  PixelPet.js     — canvas-based pixel art renderer for all 6 pets × 3 stages
  pets.js         — pet definitions, XP thresholds, stage logic
public/
  timer-worker.js — drift-correcting Web Worker
  endOfPomodoro.wav
```

---

## 🚀 Run Locally

```bash
npm install
npm start
```

Then open [http://localhost:3000/pomodoro-gamefied](http://localhost:3000/pomodoro-gamefied).

## Deploy

```bash
npm run deploy
```

Builds and pushes to the `gh-pages` branch automatically.

---

*Built with 💜 by a psychology student who understands the struggle of staying focused.*
