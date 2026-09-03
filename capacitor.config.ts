import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.liwiggwp.myplace',
  appName: 'MyPlace',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#203A5F',
      sound: 'beep.wav'
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#FAF9F6'
  }
};

export default config;
