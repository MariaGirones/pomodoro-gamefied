import { getPetById, getStageIndex, MAX_XP } from './pets';
import PixelPet from './PixelPet';

const MARKER_1_PCT = (334 / MAX_XP) * 100;
const MARKER_2_PCT = (667 / MAX_XP) * 100;

export default function PetDisplay({ petId, xp, gainCount, isRunning }) {
  const pet          = getPetById(petId);
  const stageIndex   = getStageIndex(xp);
  const isFullyEvolved = stageIndex >= 2;
  const isMaxXP      = xp >= MAX_XP;
  const nextThreshold = isFullyEvolved ? null : [334, 667][stageIndex];
  const xpToNext     = nextThreshold !== null ? nextThreshold - xp : 0;
  const barPct       = Math.min(100, (xp / MAX_XP) * 100);

  return (
    <div
      className="pet-display"
      style={{ '--pet-color': pet.color, '--pet-bg': pet.bg }}
    >
      {/* ── Sprite ── */}
      <div className="pet-frame">
        <PixelPet
          petId={petId}
          stageIndex={stageIndex}
          isRunning={isRunning}
          gainCount={gainCount}
        />
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
