# Ascendi

**A gamified Pomodoro timer where you earn XP from focus sessions to feed and evolve a pixel pet.**

> Stay focused. Earn XP. Watch your sprite grow.

## 🚀 Live Demo

**[👉 pomosprite.github.io/pomodoro-gamefied](https://MariaGirones.github.io/pomodoro-gamefied)**

---

## 🐾 How it works

1. Pick a pixel pet companion (Cat, Dog, Dragon, Bunny, Fox, or Axolotl)
2. Start a Pomodoro focus session
3. Complete the session → earn XP (1 XP per minute worked)
4. Your pet evolves at **334 XP** and again at **667 XP**, maxing out at **1000 XP**
5. Take your short or long break, then go again

Your pet, XP, settings, and cycle progress are all saved automatically — nothing is lost on refresh.

---

## ✨ Features

- **6 pixel art companions** — each with 3 evolution stages, drawn on HTML Canvas (no image files)
- **XP & evolution system** — earn XP by finishing work sessions; your pet visibly grows
- **Full Pomodoro cycle** — 4 work sessions → short break → long break, with cycle progress dots
- **Drift-free timer** — uses a Web Worker with `Date.now()` correction so the timer never drifts in background tabs
- **Custom work duration** — set sessions from 1 to 90 minutes
- **Sound + desktop notifications** when a session ends
- **Retro pixel aesthetic** — Press Start 2P font, NES-style XP bar, CRT scanline overlay, neon timer glow
- **Dark / light mode** — toggle anytime, persisted across sessions
- **Full localStorage persistence** — pet, XP, theme, work duration, and cycle count all survive page refresh
- **Mobile-friendly** — responsive layout down to 320 px

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Framework | React 19 (Create React App) |
| Styling | CSS custom properties (dark/light theming) |
| Pixel art | HTML Canvas API — procedural sprites, no images |
| Timer | Web Worker + `Date.now()` drift correction |
| Persistence | `localStorage` |
| Deployment | GitHub Pages via `gh-pages` |
| Font | Press Start 2P (Google Fonts) |

---

## 🗂️ Project structure

```
src/
  App.js          — timer logic, XP system, localStorage, session flow
  App.css         — retro theme, dark/light mode, all UI styles
  PetDisplay.js   — animated pet canvas + XP bar
  PetPicker.js    — companion selection modal
  PixelPet.js     — canvas pixel art renderer (6 pets × 3 stages)
  pets.js         — pet definitions, XP thresholds, stage logic
public/
  timer-worker.js — drift-correcting Web Worker
  endOfPomodoro.wav
```

---

## 💻 Run locally

```bash
git clone https://github.com/MariaGirones/pomodoro-gamefied.git
cd pomodoro-gamefied
npm install
npm start
```

Opens at [http://localhost:3000/pomodoro-gamefied](http://localhost:3000/pomodoro-gamefied).

## Deploy

```bash
npm run deploy
```

Builds and pushes to the `gh-pages` branch automatically.

---

*Built with 💜 by a psychology student who understands the struggle of staying focused.*
