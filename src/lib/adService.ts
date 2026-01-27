// AdMob Service - Simulates reward ads in web, ready for Capacitor native integration
// Replace AD_UNIT_IDS with your real AdMob IDs when building for production

export const AD_UNIT_IDS = {
  // Test IDs - Replace with your real AdMob unit IDs
  REWARD_HINT: 'ca-app-pub-XXXXX/hint-reward',
  REWARD_ENERGY: 'ca-app-pub-XXXXX/energy-reward',
  REWARD_LEVEL_SKIP: 'ca-app-pub-XXXXX/level-skip-reward',
  INTERSTITIAL: 'ca-app-pub-XXXXX/interstitial',
};

export type AdType = 'hint' | 'energy' | 'levelSkip';

interface AdCallbacks {
  onAdLoaded?: () => void;
  onAdFailed?: (error: string) => void;
  onAdRewarded?: () => void;
  onAdClosed?: () => void;
}

class AdService {
  private isLoading = false;
  private simulatedAdDuration = 3000; // 3 seconds for demo

  // Check if running in native Capacitor environment
  private isNative(): boolean {
    return typeof (window as any).Capacitor !== 'undefined';
  }

  // Show a simulated reward ad (web preview)
  async showRewardAd(adType: AdType, callbacks: AdCallbacks): Promise<boolean> {
    if (this.isLoading) return false;
    this.isLoading = true;

    try {
      callbacks.onAdLoaded?.();

      // Simulate watching an ad
      await new Promise((resolve) => setTimeout(resolve, this.simulatedAdDuration));

      callbacks.onAdRewarded?.();
      callbacks.onAdClosed?.();
      return true;
    } catch (error) {
      callbacks.onAdFailed?.('Ad failed to load');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // Get reward amount based on ad type
  getRewardAmount(adType: AdType): { coins?: number; energy?: number; levelSkip?: boolean } {
    switch (adType) {
      case 'hint':
        return { coins: 50 }; // Free hint worth 50 coins
      case 'energy':
        return { energy: 3 }; // Refill 3 energy
      case 'levelSkip':
        return { levelSkip: true, coins: 25 }; // Skip level + bonus coins
      default:
        return {};
    }
  }

  isAdLoading(): boolean {
    return this.isLoading;
  }
}

export const adService = new AdService();
