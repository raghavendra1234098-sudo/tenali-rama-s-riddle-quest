// Progression Unlock Service
// No real-money purchases. Premium features unlock through gameplay progression
// and coin bundles are bought with virtual in-game coins only.

import { loadGameState, spendCoins, addCoins, refillEnergy, addFreeHints } from './gameState';

export type UnlockType = 'removeAds' | 'proUpgrade';

export interface UnlockState {
  removeAds: { isActive: boolean; unlockedAt: number | null };
  proUpgrade: { isActive: boolean; unlockedAt: number | null };
}

const STORAGE_KEY = 'tenali_rama_unlocks';

// Level requirements for each premium feature
export const UNLOCK_REQUIREMENTS: Record<UnlockType, number> = {
  removeAds: 100,
  proUpgrade: 250,
};

export const UNLOCK_INFO: Record<UnlockType, { name: string; description: string }> = {
  removeAds: {
    name: 'Remove Ads',
    description: 'Enjoy uninterrupted, ad-free gameplay',
  },
  proUpgrade: {
    name: 'Pro Upgrade',
    description: 'Timer Challenge + 2x coin bonus',
  },
};

// Coin bundles - paid for with in-game coins only
export const COIN_BUNDLES = {
  goldPouch: {
    id: 'goldPouch' as const,
    name: 'Gold Pouch',
    cost: 500,
    reward: { energy: true, hints: 2, coins: 0 },
    rewardText: 'Full Energy Refill + 2 Free Hints',
  },
  royalTreasury: {
    id: 'royalTreasury' as const,
    name: 'Royal Treasury',
    cost: 2500,
    reward: { energy: true, hints: 6, coins: 1000 },
    rewardText: 'Full Energy + 6 Free Hints + 1,000 Treasure Coins',
  },
};

export type BundleId = keyof typeof COIN_BUNDLES;

const getDefaultUnlockState = (): UnlockState => ({
  removeAds: { isActive: false, unlockedAt: null },
  proUpgrade: { isActive: false, unlockedAt: null },
});

const readStoredUnlocks = (): UnlockState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...getDefaultUnlockState(), ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load unlocks:', e);
  }
  return getDefaultUnlockState();
};

const writeStoredUnlocks = (state: UnlockState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save unlocks:', e);
  }
};

// Highest level the player has completed
export const getHighestCompletedLevel = (): number => {
  const state = loadGameState();
  if (!state.completedLevels.length) return 0;
  return Math.max(...state.completedLevels);
};

// Evaluate progression and persist any newly earned unlocks (permanent once earned)
export const syncUnlocks = (): UnlockState => {
  const stored = readStoredUnlocks();
  const highest = getHighestCompletedLevel();
  let changed = false;

  (Object.keys(UNLOCK_REQUIREMENTS) as UnlockType[]).forEach((key) => {
    if (!stored[key].isActive && highest >= UNLOCK_REQUIREMENTS[key]) {
      stored[key] = { isActive: true, unlockedAt: Date.now() };
      changed = true;
    }
  });

  if (changed) writeStoredUnlocks(stored);
  return stored;
};

export const loadUnlocks = (): UnlockState => syncUnlocks();

// Ads are removed permanently once Level 100 is completed
export const hasRemovedAds = (): boolean => syncUnlocks().removeAds.isActive;

// Pro features unlock permanently once Level 250 is completed
export const hasProUpgrade = (): boolean => syncUnlocks().proUpgrade.isActive;

// Levels remaining before a feature unlocks
export const levelsUntilUnlock = (type: UnlockType): number => {
  const highest = getHighestCompletedLevel();
  return Math.max(0, UNLOCK_REQUIREMENTS[type] - highest);
};

export const getUnlockProgress = (type: UnlockType): number => {
  const highest = getHighestCompletedLevel();
  return Math.min(100, Math.round((highest / UNLOCK_REQUIREMENTS[type]) * 100));
};

// Redeem a coin bundle using in-game coins
export const redeemCoinBundle = (
  bundleId: BundleId
): { success: boolean; message: string } => {
  const bundle = COIN_BUNDLES[bundleId];
  if (!spendCoins(bundle.cost)) {
    return { success: false, message: `Not enough coins! You need ${bundle.cost.toLocaleString()} coins.` };
  }

  if (bundle.reward.energy) refillEnergy();
  if (bundle.reward.hints) addFreeHints(bundle.reward.hints);
  if (bundle.reward.coins) addCoins(bundle.reward.coins);

  return { success: true, message: `${bundle.name} claimed: ${bundle.rewardText}` };
};

export const getUnlockSummary = () => {
  const unlocks = syncUnlocks();
  return {
    adsRemoved: unlocks.removeAds.isActive,
    isPro: unlocks.proUpgrade.isActive,
    highestLevel: getHighestCompletedLevel(),
  };
};
