import { getPetById, getStageIndex, MAX_XP } from './pets';

// Marker positions on the 0-1000 bar where stages 2 and 3 unlock
const MARKER_1_PCT = (334 / MAX_XP) * 100; // 33.4 %
const MARKER_2_PCT = (667 / MAX_XP) * 100; // 66.7 %

/**
 * gainCount — incremented by the parent each time XP is awarded.
 * Changing it forces React to re-mount the emoji span, which replays
 * the CSS bounce animation from the beginning without needing JS timers.
 */
export default function PetDisplay({ petId, xp, gainCount }) {
  const pet = getPetById(petId);
  const stageIndex = getStageIndex(xp);
  const isFullyEvolved = stageIndex >= 2;
  const isMaxXP = xp >= MAX_XP;

  // XP needed for the next evolution stage (not relevant at stage 3)
  const nextThreshold = isFullyEvolved ? null : [334, 667][stageIndex];
  const xpToNext = nextThreshold !== null ? nextThreshold - xp : 0;

  const barPct = Math.min(100, (xp / MAX_XP) * 100);

  return (
    <div
      className="pet-display"
      style={{ '--pet-color': pet.color, '--pet-bg': pet.bg }}
    >
      {/* ── Sprite ── */}
      <div className="pet-frame">
        {/* key changes on every XP gain → re-mounts the element → replays animation */}
        <span key={gainCount} className={`pet-emoji${gainCount > 0 ? ' gained' : ''}`}>
          {pet.stages[stageIndex]}
        </span>
        <span className="pet-stage-badge">{pet.stageNames[stageIndex]}</span>
      </div>
      <p className="pet-name">{pet.name}</p>

      {/* ── XP bar ── */}
      <div className="xp-section">
        <div className="xp-label-row">
          <span className="xp-count">XP {xp} / {MAX_XP}</span>
          {isMaxXP ? (
            <span className="xp-status xp-maxed">✨ Max XP!</span>
          ) : isFullyEvolved ? (
            <span className="xp-status">Fully evolved</span>
          ) : (
            <span className="xp-status">{xpToNext} XP → Stage {stageIndex + 2}</span>
          )}
        </div>

        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${barPct}%` }} />
          <div className="xp-marker" style={{ left: `${MARKER_1_PCT}%` }} />
          <div className="xp-marker" style={{ left: `${MARKER_2_PCT}%` }} />
        </div>

        <div className="xp-stage-labels">
          <span>S1</span>
          <span style={{ left: `${MARKER_1_PCT}%` }}>S2</span>
          <span style={{ left: `${MARKER_2_PCT}%` }}>S3</span>
        </div>
      </div>
    </div>
  );
}
