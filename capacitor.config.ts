import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.74c07614935247b5beeb8bdbb2a81325',
  appName: 'class-print-flow',
  webDir: 'dist',
  server: {
    url: 'https://74c07614-9352-47b5-beeb-8bdbb2a81325.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
