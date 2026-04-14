import { useEffect, useRef } from 'react';
import { PETS } from './pets';
import { drawPet } from './petSprites';

function PetPreview({ petId, bg }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawPet(ctx, petId, 0, 0, true); // stage 0, frame 0, resting
  }, [petId]);

  return (
    <canvas
      ref={ref}
      width={48}
      height={48}
      style={{ imageRendering: 'pixelated', background: bg }}
    />
  );
}

export default function PetPicker({ currentPetId, onSelect }) {
  return (
    <div className="pet-picker">
      {PETS.map(pet => (
        <button
          key={pet.id}
          className={`pet-card${currentPetId === pet.id ? ' pet-card-selected' : ''}`}
          style={{ '--pet-color': pet.color, '--pet-bg': pet.bg }}
          onClick={() => onSelect(pet.id)}
          aria-pressed={currentPetId === pet.id}
        >
          <PetPreview petId={pet.id} bg={pet.bg} />
          <span className="pet-card-name">{pet.name}</span>
          <span className="pet-card-desc">{pet.description}</span>
        </button>
      ))}
    </div>
  );
}
