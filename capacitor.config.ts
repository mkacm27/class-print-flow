import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.printease.android',
  appName: 'PrintEase',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff'
  }
};

export default config;
