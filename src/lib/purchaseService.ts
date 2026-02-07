// In-App Purchase Service
// Manages Remove Ads, Pro Upgrade, and purchase restoration

export type PurchaseType = 'removeAds' | 'proUpgrade';
export type PurchasePlan = 'monthly' | 'lifetime';

export interface PurchaseState {
  removeAds: {
    isActive: boolean;
    plan: PurchasePlan | null;
    purchaseDate: number | null;
    expiryDate: number | null;
    transactionId: string | null;
  };
  proUpgrade: {
    isActive: boolean;
    plan: PurchasePlan | null;
    purchaseDate: number | null;
    expiryDate: number | null;
    transactionId: string | null;
  };
}

const STORAGE_KEY = 'tenali_rama_purchases';

// Purchase Plans Configuration
export const PURCHASE_PLANS = {
  removeAds: {
    monthly: {
      name: 'Ad-Free Monthly',
      price: 49,
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
      description: 'No ads for 30 days',
    },
    lifetime: {
      name: 'Ad-Free Forever',
      price: 199,
      duration: null, // Lifetime - never expires
      description: 'One-time purchase, permanent ad removal',
    },
  },
  proUpgrade: {
    monthly: {
      name: 'Pro Monthly',
      price: 99,
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
      description: 'Timer Challenges & Pro features for 30 days',
    },
    lifetime: {
      name: 'Pro Forever',
      price: 349,
      duration: null, // Lifetime
      description: 'One-time purchase, permanent Pro access',
    },
  },
};

// UPI Payment Configuration
const UPI_CONFIG = {
  merchantName: 'Tenali Rama: Wisdom & Wit',
  upiId: '8639470264@ybl',
};

// Default purchase state
export const getDefaultPurchaseState = (): PurchaseState => ({
  removeAds: {
    isActive: false,
    plan: null,
    purchaseDate: null,
    expiryDate: null,
    transactionId: null,
  },
  proUpgrade: {
    isActive: false,
    plan: null,
    purchaseDate: null,
    expiryDate: null,
    transactionId: null,
  },
});

// Load purchases from storage
export const loadPurchases = (): PurchaseState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PurchaseState;
      
      // Check for expired subscriptions
      const now = Date.now();
      
      // Check Remove Ads expiry
      if (state.removeAds.isActive && state.removeAds.expiryDate) {
        if (now > state.removeAds.expiryDate) {
          state.removeAds = getDefaultPurchaseState().removeAds;
        }
      }
      
      // Check Pro Upgrade expiry
      if (state.proUpgrade.isActive && state.proUpgrade.expiryDate) {
        if (now > state.proUpgrade.expiryDate) {
          state.proUpgrade = getDefaultPurchaseState().proUpgrade;
        }
      }
      
      savePurchases(state);
      return state;
    }
  } catch (e) {
    console.error('Failed to load purchases:', e);
  }
  return getDefaultPurchaseState();
};

// Save purchases to storage
export const savePurchases = (state: PurchaseState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save purchases:', e);
  }
};

// Check if ads are removed
export const hasRemovedAds = (): boolean => {
  const purchases = loadPurchases();
  if (!purchases.removeAds.isActive) return false;
  
  // Lifetime purchases never expire
  if (purchases.removeAds.plan === 'lifetime') return true;
  
  // Check if subscription is still valid
  if (purchases.removeAds.expiryDate) {
    return Date.now() < purchases.removeAds.expiryDate;
  }
  
  return false;
};

// Check if user has Pro upgrade
export const hasProUpgrade = (): boolean => {
  const purchases = loadPurchases();
  if (!purchases.proUpgrade.isActive) return false;
  
  // Lifetime purchases never expire
  if (purchases.proUpgrade.plan === 'lifetime') return true;
  
  // Check if subscription is still valid
  if (purchases.proUpgrade.expiryDate) {
    return Date.now() < purchases.proUpgrade.expiryDate;
  }
  
  return false;
};

// Generate UPI payment link for purchase
export const generatePurchaseLink = (
  purchaseType: PurchaseType,
  plan: PurchasePlan
): string => {
  const planConfig = PURCHASE_PLANS[purchaseType][plan];
  const transactionNote = `${planConfig.name} - Tenali Rama`;
  const transactionRef = `TR${purchaseType.toUpperCase()}${Date.now()}`;
  
  return `upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${planConfig.price}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionRef}`;
};

// Activate a purchase after successful payment
export const activatePurchase = (
  purchaseType: PurchaseType,
  plan: PurchasePlan,
  transactionId: string
): PurchaseState => {
  const planConfig = PURCHASE_PLANS[purchaseType][plan];
  const now = Date.now();
  
  const state = loadPurchases();
  
  state[purchaseType] = {
    isActive: true,
    plan,
    purchaseDate: now,
    expiryDate: planConfig.duration ? now + planConfig.duration : null, // null for lifetime
    transactionId,
  };
  
  savePurchases(state);
  return state;
};

// Restore all purchases (for reinstall scenarios)
export const restorePurchases = (): PurchaseState | null => {
  const purchases = loadPurchases();
  
  const hasActive = purchases.removeAds.isActive || purchases.proUpgrade.isActive;
  
  if (hasActive) {
    return purchases;
  }
  
  return null;
};

// Get remaining days for a subscription
export const getRemainingDays = (purchaseType: PurchaseType): number | null => {
  const purchases = loadPurchases();
  const purchase = purchases[purchaseType];
  
  if (!purchase.isActive) return null;
  if (purchase.plan === 'lifetime') return null; // Infinite
  if (!purchase.expiryDate) return null;
  
  const remaining = purchase.expiryDate - Date.now();
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
};

// Format expiry date for display
export const formatPurchaseExpiry = (purchaseType: PurchaseType): string => {
  const purchases = loadPurchases();
  const purchase = purchases[purchaseType];
  
  if (!purchase.isActive) return 'Not purchased';
  if (purchase.plan === 'lifetime') return 'Lifetime Access';
  if (!purchase.expiryDate) return 'Unknown';
  
  const date = new Date(purchase.expiryDate);
  return `Expires: ${date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
};

// Get purchase status summary
export const getPurchaseSummary = () => {
  const purchases = loadPurchases();
  
  return {
    adsRemoved: hasRemovedAds(),
    isPro: hasProUpgrade(),
    removeAdsExpiry: formatPurchaseExpiry('removeAds'),
    proExpiry: formatPurchaseExpiry('proUpgrade'),
    removeAdsDays: getRemainingDays('removeAds'),
    proDays: getRemainingDays('proUpgrade'),
  };
};
