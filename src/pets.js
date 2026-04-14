export const PETS = [
  {
    id: 'cat',
    name: 'Mochi',
    description: 'A sleepy orange tabby who loves focus time',
    color: '#e8782a',
    bg: '#fff3e0',
    stageNames: ['Kitten', 'Cat', 'Elder Cat'],
  },
  {
    id: 'dog',
    name: 'Sunny',
    description: 'An enthusiastic golden pup cheering you on',
    color: '#e8b84b',
    bg: '#fffde7',
    stageNames: ['Puppy', 'Dog', 'Good Boy'],
  },
  {
    id: 'dragon',
    name: 'Drakon',
    description: 'An ancient dragon awakening from its egg',
    color: '#1abc9c',
    bg: '#e0f8f3',
    stageNames: ['Egg', 'Whelp', 'Dragon'],
  },
  {
    id: 'bunny',
    name: 'Pochi',
    description: 'A soft lavender bunny with oversized ears',
    color: '#9b82c2',
    bg: '#f3effe',
    stageNames: ['Kit', 'Bunny', 'Grand Hare'],
  },
  {
    id: 'fox',
    name: 'Kira',
    description: 'A clever orange fox with a fluffy white tail',
    color: '#e8622a',
    bg: '#fff0e8',
    stageNames: ['Kit', 'Fox', 'Spirit Fox'],
  },
  {
    id: 'axolotl',
    name: 'Axie',
    description: 'A pink axolotl with magnificent frilly gills',
    color: '#e0607a',
    bg: '#fce4ec',
    stageNames: ['Larva', 'Axolotl', 'Ancient Axie'],
  },
];

// Thresholds at which each stage unlocks.
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
