import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AppData } from '../types';
import { getCyclePrediction, parseDate } from '../utils/cycleMath';
import { getTodayString } from '../utils/cycleMath';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications(appData: AppData) {
  useEffect(() => {
    async function setupNotifications() {
      if (Platform.OS !== 'ios') return;

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const res = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          }
        });
        if (res.status !== 'granted') return;
      }

      if (!appData.notificationSettings.enabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }

      // Clear existing scheduled notifications to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 1. Schedule Pill Reminders
      if (appData.notificationSettings.pillReminders) {
        for (const pill of appData.pills.filter(p => p.active)) {
          for (const timeStr of pill.times) {
            const [h, m] = timeStr.split(':').map(Number);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `💊 Время принять: ${pill.name}`,
                body: `Дозировка: ${pill.dosage}. Отметьте в приложении Luna!`,
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: h,
                minute: m,
              },
            });
          }
        }
      }

      // 2. Schedule Water Reminders
      if (appData.notificationSettings.waterReminders && appData.waterSettings.enabledReminders) {
        const [startH] = appData.waterSettings.reminderStartTime.split(':').map(Number);
        const [endH] = appData.waterSettings.reminderEndTime.split(':').map(Number);
        const step = Math.max(1, Math.round(appData.waterSettings.reminderIntervalHours));

        for (let hour = startH; hour <= endH; hour += step) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💧 Пора выпить воды!',
              body: 'Сделайте пару глотков чистой воды для бодрости и здоровья ✨',
              sound: 'default',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour,
              minute: 0,
            },
          });
        }
      }

      // 3. Schedule Cycle Warning
      if (appData.notificationSettings.cycleReminders) {
        const prediction = getCyclePrediction(appData.periods, appData.cycleSettings, getTodayString());
        if (prediction.daysUntilNextPeriod >= 1 && prediction.daysUntilNextPeriod <= 3) {
          const targetDate = parseDate(prediction.nextPeriodStartDate);
          targetDate.setDate(targetDate.getDate() - 1); // 1 day before
          targetDate.setHours(9, 0, 0, 0);

          if (targetDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🌸 Приближение нового цикла',
                body: 'По прогнозу следующий цикл начнется завтра. Позаботьтесь об отдыхе!',
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
              },
            });
          }
        }
      }
    }

    setupNotifications();
  }, [appData]);

  const testTrigger = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌸 Luna: Тестовое уведомление',
        body: 'Нативные уведомления настроены и работают на вашем iPhone!',
        sound: 'default',
      },
      trigger: null, // Instant trigger
    });
  };

  return { testTrigger };
}
