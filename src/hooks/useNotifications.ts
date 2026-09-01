import { useState, useEffect, useCallback } from 'react';
import type { NotificationSettings, Pill, PillLog, WaterSettings } from '../types';
import { getTodayString } from '../utils/dateUtils';

export function useNotifications(
  settings: NotificationSettings,
  pills: Pill[],
  pillLogs: PillLog[],
  waterSettings: WaterSettings
) {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'pill' | 'water' | 'cycle' | 'info';
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Уведомления не поддерживаются вашим браузером. Добавьте приложение на экран «Домой» (Safari iOS 16.4+) для поддержки уведомлений.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  };

  const sendNotification = useCallback(
    async (title: string, body: string, icon: string = '/favicon.svg', type: 'pill' | 'water' | 'cycle' | 'info' = 'info') => {
      setActiveAlert({
        id: Math.random().toString(36).substring(2, 9),
        title,
        body,
        type
      });

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
              reg.showNotification(title, {
                body,
                icon,
                badge: '/favicon.svg',
                vibrate: [200, 100, 200]
              } as NotificationOptions);
              return;
            }
          }
          new Notification(title, {
            body,
            icon
          });
        } catch (e) {
          console.warn('Could not display system notification:', e);
        }
      }
    },
    []
  );

  const testNotification = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    sendNotification(
      '🌸 Luna: Тестовое уведомление',
      'Уведомления настроены и отлично работают на вашем iPhone!',
      '/favicon.svg',
      'info'
    );
  };

  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const todayStr = getTodayString();

      // Check Pill Reminders
      if (settings.pillReminders) {
        pills.filter(p => p.active).forEach(pill => {
          if (pill.times.includes(currentTimeStr)) {
            const alreadyLogged = pillLogs.some(
              log => log.pillId === pill.id && log.date === todayStr && log.scheduledTime === currentTimeStr && log.status === 'taken'
            );

            if (!alreadyLogged) {
              sendNotification(
                `💊 Время принять: ${pill.name}`,
                `Дозировка: ${pill.dosage}. Не забудьте отметить в приложении!`,
                '/favicon.svg',
                'pill'
              );
            }
          }
        });
      }

      // Check Water Reminders
      if (settings.waterReminders && waterSettings.enabledReminders) {
        const [startH] = waterSettings.reminderStartTime.split(':').map(Number);
        const [endH] = waterSettings.reminderEndTime.split(':').map(Number);
        const currentH = now.getHours();

        if (currentH >= startH && currentH <= endH && minutes === '00') {
          if (currentH % Math.max(1, Math.round(waterSettings.reminderIntervalHours)) === 0) {
            sendNotification(
              '💧 Пора выпить воды!',
              'Сделайте пару глотков чистой воды для поддержания баланса и энергии ✨',
              '/favicon.svg',
              'water'
            );
          }
        }
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [settings, pills, pillLogs, waterSettings, sendNotification]);

  return {
    permission,
    requestPermission,
    sendNotification,
    testNotification,
    activeAlert,
    dismissAlert: () => setActiveAlert(null)
  };
}
