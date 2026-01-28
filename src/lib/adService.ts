// AdMob Service - Uses real AdMob SDK on native, simulates on web
// Replace AD_UNIT_IDS with your real AdMob IDs from https://admob.google.com

export const AD_UNIT_IDS = {
  // ⚠️ REPLACE THESE with your real AdMob unit IDs before building APK
  // Format: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
  REWARD_HINT: 'ca-app-pub-3940256099942544/5224354917', // Test ID - replace with yours
  REWARD_ENERGY: 'ca-app-pub-3940256099942544/5224354917', // Test ID - replace with yours
  REWARD_LEVEL_SKIP: 'ca-app-pub-3940256099942544/5224354917', // Test ID - replace with yours
  
  // Your AdMob App ID (required in AndroidManifest.xml)
  // Format: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
  APP_ID: 'ca-app-pub-3940256099942544~3347511713', // Test App ID - replace with yours
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
  private isInitialized = false;
  private simulatedAdDuration = 3000; // 3 seconds for web demo
  private admobModule: any = null;

  // Check if running in native Capacitor environment
  private isNative(): boolean {
    return typeof (window as any).Capacitor !== 'undefined';
  }

  // Initialize AdMob (call once on app start)
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative()) {
      try {
        // Dynamic import - only works when @capacitor-community/admob is installed
        this.admobModule = await import('@capacitor-community/admob' as any);
        const { AdMob } = this.admobModule;
        
        await AdMob.initialize({
          initializeForTesting: false, // Set to false for production
        });
        
        console.log('AdMob initialized successfully');
        this.isInitialized = true;
      } catch (error) {
        console.warn('AdMob not available - using simulation:', error);
        this.isInitialized = true;
      }
    } else {
      console.log('Running in web mode - AdMob simulation active');
      this.isInitialized = true;
    }
  }

  // Get the appropriate ad unit ID for the ad type
  private getAdUnitId(adType: AdType): string {
    switch (adType) {
      case 'hint':
        return AD_UNIT_IDS.REWARD_HINT;
      case 'energy':
        return AD_UNIT_IDS.REWARD_ENERGY;
      case 'levelSkip':
        return AD_UNIT_IDS.REWARD_LEVEL_SKIP;
      default:
        return AD_UNIT_IDS.REWARD_HINT;
    }
  }

  // Show a reward ad (real on native, simulated on web)
  async showRewardAd(adType: AdType, callbacks: AdCallbacks): Promise<boolean> {
    if (this.isLoading) return false;
    this.isLoading = true;

    try {
      if (this.isNative() && this.admobModule) {
        return await this.showNativeRewardAd(adType, callbacks);
      } else {
        return await this.showSimulatedAd(callbacks);
      }
    } catch (error) {
      console.error('Ad error:', error);
      callbacks.onAdFailed?.('Ad failed to load');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // Real AdMob reward ad for native
  private async showNativeRewardAd(adType: AdType, callbacks: AdCallbacks): Promise<boolean> {
    if (!this.admobModule) {
      return this.showSimulatedAd(callbacks);
    }

    try {
      const { AdMob, RewardAdPluginEvents } = this.admobModule;
      
      // Set up event listeners
      const loadedListener = AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Reward ad loaded');
        callbacks.onAdLoaded?.();
      });

      const failedListener = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: any) => {
        console.error('Reward ad failed to load:', error);
        callbacks.onAdFailed?.(error.message || 'Failed to load ad');
      });

      const rewardedListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        console.log('User earned reward');
        callbacks.onAdRewarded?.();
      });

      const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Reward ad dismissed');
        callbacks.onAdClosed?.();
        
        // Clean up listeners
        loadedListener.remove();
        failedListener.remove();
        rewardedListener.remove();
        dismissedListener.remove();
      });

      // Prepare and show the ad
      await AdMob.prepareRewardVideoAd({
        adId: this.getAdUnitId(adType),
        isTesting: false, // Set to false for production
      });

      await AdMob.showRewardVideoAd();
      return true;
    } catch (error) {
      console.error('Native ad error:', error);
      callbacks.onAdFailed?.('Ad not available');
      return false;
    }
  }

  // Simulated ad for web preview
  private async showSimulatedAd(callbacks: AdCallbacks): Promise<boolean> {
    try {
      callbacks.onAdLoaded?.();
      await new Promise((resolve) => setTimeout(resolve, this.simulatedAdDuration));
      callbacks.onAdRewarded?.();
      callbacks.onAdClosed?.();
      return true;
    } catch (error) {
      callbacks.onAdFailed?.('Ad simulation failed');
      return false;
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
