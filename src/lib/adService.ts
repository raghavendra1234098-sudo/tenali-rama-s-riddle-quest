// AdMob Service - Uses real AdMob SDK on native, simulates on web
// Replace AD_UNIT_IDS with your real AdMob IDs from https://admob.google.com
// Integrates with purchase service to skip ads for premium users

import { hasRemovedAds } from './purchaseService';

export const AD_UNIT_IDS = {
  // Production AdMob Unit IDs
  REWARD_HINT: 'ca-app-pub-5228157365366428/7995990493',
  REWARD_ENERGY: 'ca-app-pub-5228157365366428/7995990493',
  REWARD_LEVEL_SKIP: 'ca-app-pub-5228157365366428/7995990493',
  REWARD_COINS: 'ca-app-pub-5228157365366428/7995990493',
  BANNER: 'ca-app-pub-5228157365366428/2116977854',
  INTERSTITIAL: 'ca-app-pub-5228157365366428/3976854435',
  
  // Your AdMob App ID (add this to AndroidManifest.xml)
  APP_ID: 'ca-app-pub-5228157365366428~3488535748',
};

export type AdType = 'hint' | 'energy' | 'levelSkip' | 'coins';

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
        // Dynamic import with string variable to prevent Rollup from bundling
        const admobPath = '@capacitor-community/admob';
        this.admobModule = await import(/* @vite-ignore */ admobPath);
        const { AdMob } = this.admobModule;
        
        await AdMob.initialize({
          // Test ads enabled in development to protect AdMob account; live ads used in production
          initializeForTesting: import.meta.env.DEV,
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
      case 'coins':
        return AD_UNIT_IDS.REWARD_COINS;
      default:
        return AD_UNIT_IDS.REWARD_HINT;
    }
  }

  // Check if ads should be shown (respects Remove Ads purchase)
  shouldShowAds(): boolean {
    return !hasRemovedAds();
  }

  // Show a reward ad (real on native, simulated on web)
  // Note: Reward ads are ALWAYS shown even for premium users (they opt-in for rewards)
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

  // Show interstitial ad (respects Remove Ads purchase)
  async showInterstitialAd(): Promise<boolean> {
    // Skip if user has purchased Remove Ads
    if (hasRemovedAds()) {
      console.log('Interstitial skipped - user has Remove Ads');
      return true;
    }

    if (this.isLoading) return false;
    this.isLoading = true;

    try {
      if (this.isNative() && this.admobModule) {
        const { AdMob } = this.admobModule;
        await AdMob.prepareInterstitial({ adId: AD_UNIT_IDS.INTERSTITIAL });
        await AdMob.showInterstitial();
        return true;
      } else {
        // Simulate interstitial on web
        console.log('Simulated interstitial ad');
        return true;
      }
    } catch (error) {
      console.error('Interstitial error:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // Show banner ad (respects Remove Ads purchase)
  async showBannerAd(): Promise<boolean> {
    // Skip if user has purchased Remove Ads
    if (hasRemovedAds()) {
      console.log('Banner skipped - user has Remove Ads');
      return true;
    }

    try {
      if (this.isNative() && this.admobModule) {
        const { AdMob, BannerAdSize, BannerAdPosition } = this.admobModule;
        await AdMob.showBanner({
          adId: AD_UNIT_IDS.BANNER,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        return true;
      }
      return true;
    } catch (error) {
      console.error('Banner error:', error);
      return false;
    }
  }

  // Hide banner ad
  async hideBannerAd(): Promise<void> {
    try {
      if (this.isNative() && this.admobModule) {
        const { AdMob } = this.admobModule;
        await AdMob.hideBanner();
      }
    } catch (error) {
      console.error('Hide banner error:', error);
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
  getRewardAmount(adType: AdType): { coins?: number; energy?: number; levelSkip?: boolean; hints?: number } {
    switch (adType) {
      case 'hint':
        return { hints: 1 }; // One free hint
      case 'energy':
        return { energy: 5 }; // Full energy refill
      case 'levelSkip':
        return { levelSkip: true, coins: 25 }; // Skip level + bonus coins
      case 'coins':
        return { coins: 50 }; // 50 bonus coins
      default:
        return {};
    }
  }

  isAdLoading(): boolean {
    return this.isLoading;
  }
}

export const adService = new AdService();
