import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenalirama.wisdomwit',
  appName: 'Tenali Rama: Wisdom & Wit',
  webDir: 'dist',
  // PRODUCTION BUILD: Server block removed for APK/AAB build
  // For development/testing with live reload, uncomment below:
  // server: {
  //   url: 'https://f22cc083-84cc-43f2-b37a-9308347d4698.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    },
    backgroundColor: '#1a0a0a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#1a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  }
};

export default config;
