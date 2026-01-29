import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f22cc08384cc43f2b37a9308347d4698',
  appName: 'Tenali Rama: Wisdom & Wit',
  webDir: 'dist',
  server: {
    // Hot-reload from Lovable preview during development
    url: 'https://f22cc083-84cc-43f2-b37a-9308347d4698.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  plugins: {
    // AdMob configuration will be handled in AndroidManifest.xml
  }
};

export default config;
