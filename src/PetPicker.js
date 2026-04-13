import { PETS } from './pets';

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
          <span className="pet-card-emoji">{pet.stages[0]}</span>
          <span className="pet-card-name">{pet.name}</span>
          <span className="pet-card-desc">{pet.description}</span>
        </button>
      ))}
    </div>
  );
}
