export const PETS = [
  {
    id: 'tomato',
    name: 'Tomatito',
    description: 'A studious tomato growing in strength',
    color: '#e74c3c',
    bg: '#fde8e8',
    stages: ['🌱', '🍃', '🍅'],
    stageNames: ['Sprout', 'Leaf', 'Tomato'],
  },
  {
    id: 'dragon',
    name: 'Drakon',
    description: 'An ancient dragon waking from its egg',
    color: '#8e44ad',
    bg: '#f0e6f6',
    stages: ['🥚', '🐣', '🐉'],
    stageNames: ['Egg', 'Hatchling', 'Dragon'],
  },
  {
    id: 'robot',
    name: 'Bitbot',
    description: 'A tiny robot evolving with every session',
    color: '#2980b9',
    bg: '#e8f4fb',
    stages: ['🔋', '⚙️', '🤖'],
    stageNames: ['Battery', 'Gear', 'Robot'],
  },
  {
    id: 'bear',
    name: 'Brumi',
    description: 'A forest bear cub growing brave',
    color: '#e67e22',
    bg: '#fdf0e0',
    stages: ['🐾', '🐨', '🐻'],
    stageNames: ['Tracks', 'Cub', 'Bear'],
  },
  {
    id: 'star',
    name: 'Lumia',
    description: 'A star gathering cosmic energy',
    color: '#f39c12',
    bg: '#fef9e7',
    stages: ['✨', '⭐', '🌟'],
    stageNames: ['Spark', 'Star', 'Nova'],
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'A mischievous spirit finding its power',
    color: '#636e72',
    bg: '#f0f0f3',
    stages: ['🫧', '👻', '💀'],
    stageNames: ['Wisp', 'Ghost', 'Specter'],
  },
];

// Thresholds at which each stage unlocks.
// STAGE_THRESHOLDS[i] = minimum XP to reach stage i.
export const STAGE_THRESHOLDS = [0, 334, 667];
export const MAX_XP = 1000;

/** 0-based stage index (0 = stage 1, 1 = stage 2, 2 = stage 3). */
export function getStageIndex(xp) {
  if (xp >= 667) return 2;
  if (xp >= 334) return 1;
  return 0;
}

export function getPetById(id) {
  return PETS.find(p => p.id === id) ?? PETS[0];
}
