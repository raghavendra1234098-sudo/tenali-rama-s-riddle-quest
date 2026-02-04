// Subscription Service for Premium Level Access
// Handles subscription status, persistence, and UPI payment integration

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface SubscriptionState {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  startDate: number | null;
  expiryDate: number | null;
  transactionId: string | null;
}

const STORAGE_KEY = 'tenali_rama_subscription';

// Plan prices and durations
export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly',
    price: 99,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    savings: null,
  },
  yearly: {
    name: 'Yearly',
    price: 499,
    duration: 365 * 24 * 60 * 60 * 1000, // 365 days in ms
    savings: '₹689 saved (58% off)',
  },
};

// UPI Payment Configuration
const UPI_CONFIG = {
  merchantName: 'Tenali Rama: Wisdom & Wit',
  upiId: '8328372587@fam',
};

// Get default subscription state
export const getDefaultSubscription = (): SubscriptionState => ({
  isActive: false,
  plan: null,
  startDate: null,
  expiryDate: null,
  transactionId: null,
});

// Load subscription from storage
export const loadSubscription = (): SubscriptionState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as SubscriptionState;
      
      // Check if subscription has expired
      if (state.expiryDate && Date.now() > state.expiryDate) {
        // Subscription expired - reset to inactive
        const expiredState = getDefaultSubscription();
        saveSubscription(expiredState);
        return expiredState;
      }
      
      return state;
    }
  } catch (e) {
    console.error('Failed to load subscription:', e);
  }
  return getDefaultSubscription();
};

// Save subscription to storage
export const saveSubscription = (state: SubscriptionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save subscription:', e);
  }
};

// Check if user has active premium subscription
export const hasPremiumAccess = (): boolean => {
  const sub = loadSubscription();
  return sub.isActive && sub.expiryDate !== null && Date.now() < sub.expiryDate;
};

// Get remaining days of subscription
export const getRemainingDays = (): number => {
  const sub = loadSubscription();
  if (!sub.expiryDate) return 0;
  const remaining = sub.expiryDate - Date.now();
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
};

// Generate UPI payment link
export const generateUPIPaymentLink = (plan: SubscriptionPlan): string => {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  const transactionNote = `Tenali Rama ${planDetails.name} Subscription`;
  const transactionRef = `TR${Date.now()}`;
  
  const upiLink = `upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${planDetails.price}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionRef}`;
  
  return upiLink;
};

// Activate subscription after successful payment
export const activateSubscription = (plan: SubscriptionPlan, transactionId: string): SubscriptionState => {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  const now = Date.now();
  
  const newState: SubscriptionState = {
    isActive: true,
    plan,
    startDate: now,
    expiryDate: now + planDetails.duration,
    transactionId,
  };
  
  saveSubscription(newState);
  return newState;
};

// Cancel subscription (keeps access until expiry)
export const cancelSubscription = (): SubscriptionState => {
  const current = loadSubscription();
  // Just mark as cancelled, don't remove access yet
  return current;
};

// Restore purchase - for reinstall scenarios
export const restorePurchase = (): SubscriptionState | null => {
  // In a real app, this would verify with a backend
  // For now, just check localStorage
  const sub = loadSubscription();
  if (sub.isActive && sub.expiryDate && Date.now() < sub.expiryDate) {
    return sub;
  }
  return null;
};

// Format expiry date for display
export const formatExpiryDate = (): string => {
  const sub = loadSubscription();
  if (!sub.expiryDate) return 'No active subscription';
  
  const date = new Date(sub.expiryDate);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Check if level requires premium
export const levelRequiresPremium = (level: number): boolean => {
  return level > 400;
};

// Can access level (free or has premium)
export const canAccessLevel = (level: number): boolean => {
  if (level <= 400) return true;
  return hasPremiumAccess();
};
