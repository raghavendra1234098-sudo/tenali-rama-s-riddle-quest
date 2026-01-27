// Game state management with localStorage persistence

export interface GameState {
  currentLevel: number;
  totalCoins: number;
  hintsUsed: number;
  riddlesSolved: number;
  energy: number;
  lastEnergyRefill: number;
  unlockedLevels: number[];
  completedLevels: number[];
}

const STORAGE_KEY = 'tenali_rama_game_state';
const MAX_ENERGY = 5;
const ENERGY_REFILL_TIME = 30 * 60 * 1000; // 30 minutes

export const getDefaultState = (): GameState => ({
  currentLevel: 1,
  totalCoins: 100,
  hintsUsed: 0,
  riddlesSolved: 0,
  energy: MAX_ENERGY,
  lastEnergyRefill: Date.now(),
  unlockedLevels: [1],
  completedLevels: [],
});

export const loadGameState = (): GameState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as GameState;
      // Refill energy based on time passed
      const timePassed = Date.now() - state.lastEnergyRefill;
      const energyToAdd = Math.floor(timePassed / ENERGY_REFILL_TIME);
      if (energyToAdd > 0) {
        state.energy = Math.min(MAX_ENERGY, state.energy + energyToAdd);
        state.lastEnergyRefill = Date.now();
      }
      return state;
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return getDefaultState();
};

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
};

export const updateGameState = (updates: Partial<GameState>): GameState => {
  const current = loadGameState();
  const newState = { ...current, ...updates };
  saveGameState(newState);
  return newState;
};

export const completeLevel = (level: number, coinsEarned: number): GameState => {
  const state = loadGameState();
  if (!state.completedLevels.includes(level)) {
    state.completedLevels.push(level);
    state.riddlesSolved += 1;
  }
  state.totalCoins += coinsEarned;
  
  // Unlock next level
  const nextLevel = level + 1;
  if (nextLevel <= 400 && !state.unlockedLevels.includes(nextLevel)) {
    state.unlockedLevels.push(nextLevel);
  }
  
  state.currentLevel = nextLevel <= 400 ? nextLevel : level;
  saveGameState(state);
  return state;
};

export const useEnergy = (): boolean => {
  const state = loadGameState();
  if (state.energy > 0) {
    state.energy -= 1;
    saveGameState(state);
    return true;
  }
  return false;
};

export const refillEnergy = (): GameState => {
  const state = loadGameState();
  state.energy = MAX_ENERGY;
  state.lastEnergyRefill = Date.now();
  saveGameState(state);
  return state;
};

export const addEnergy = (amount: number): GameState => {
  const state = loadGameState();
  state.energy = Math.min(MAX_ENERGY, state.energy + amount);
  state.lastEnergyRefill = Date.now();
  saveGameState(state);
  return state;
};

export const spendCoins = (amount: number): boolean => {
  const state = loadGameState();
  if (state.totalCoins >= amount) {
    state.totalCoins -= amount;
    saveGameState(state);
    return true;
  }
  return false;
};

export const addCoins = (amount: number): GameState => {
  const state = loadGameState();
  state.totalCoins += amount;
  saveGameState(state);
  return state;
};

export const useHint = (): boolean => {
  const state = loadGameState();
  if (spendCoins(50)) {
    state.hintsUsed += 1;
    saveGameState(state);
    return true;
  }
  return false;
};
