import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.connectpro.app",
  appName: "Blaffa Pay",
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    App: {
      backButtonWebHandlerEnabled: true,
    }
  }
};

export default config;
