import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class NativeHapticsService {
  private static isNative = Capacitor.isNativePlatform();

  /**
   * Light click haptic for buttons, tab switching, and navigation
   */
  static async lightClick(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {}
    } else if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch {}
    }
  }

  /**
   * Medium impact for task completion, pill logging, toggles
   */
  static async mediumTick(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
    } else if (navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
  }

  /**
   * Heavy impact for adding large amounts, size cycle
   */
  static async heavyBump(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch {}
    } else if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch {}
    }
  }

  /**
   * Success notification vibration for completing daily goals or confetti
   */
  static async successCelebration(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {}
    } else if (navigator.vibrate) {
      try { navigator.vibrate([30, 40, 50]); } catch {}
    }
  }
}
