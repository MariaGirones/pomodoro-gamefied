import { useEffect, useRef, useState } from 'react';
import { drawPet } from './petSprites';

const CANVAS_SIZE = 64;
const FRAME_MS = 600; // ms per animation frame

/**
 * Renders a pixel-art pet on a <canvas>.
 *
 * Props:
 *   petId      – one of: cat, dog, dragon, bunny, fox, axolotl
 *   stageIndex – 0 | 1 | 2
 *   isRunning  – true while the timer is ticking (triggers idle animation)
 *   gainCount  – incremented each time XP is earned (triggers bounce)
 */
export default function PixelPet({ petId, stageIndex, isRunning, gainCount }) {
  const canvasRef   = useRef(null);
  const frameRef    = useRef(0);
  const intervalRef = useRef(null);
  const [bouncing, setBouncing] = useState(false);

  // Draw current frame
  const render = (af, resting) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawPet(ctx, petId, stageIndex, af, resting);
  };

  // Re-draw whenever pet, stage, or run-state changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    frameRef.current = 0;
    render(0, !isRunning);

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        frameRef.current = frameRef.current === 0 ? 1 : 0;
        render(frameRef.current, false);
      }, FRAME_MS);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [petId, stageIndex, isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bounce animation on XP gain
  useEffect(() => {
    if (gainCount === 0) return;
    setBouncing(true);
    const t = setTimeout(() => setBouncing(false), 650);
    return () => clearTimeout(t);
  }, [gainCount]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={`pixel-pet${bouncing ? ' pixel-pet-bounce' : ''}`}
      aria-label="Pet sprite"
    />
  );
}
