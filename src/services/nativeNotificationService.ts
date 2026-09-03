import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { ScheduleOptions } from '@capacitor/local-notifications';
import type { AppData, Pill } from '../types';
import { getCyclePrediction } from '../utils/cycleCalculations';
import { getTodayString, parseDateString } from '../utils/dateUtils';

export class NativeNotificationService {
  private static isNative = Capacitor.isNativePlatform();

  /**
   * Request system notification permissions on iOS/Android or Web
   */
  static async requestPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } catch (e) {
        console.warn('Native notification permission error:', e);
        return false;
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        return result === 'granted';
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Cancel all pending scheduled notifications and re-schedule based on current appData
   */
  static async syncAllReminders(appData: AppData): Promise<void> {
    const settings = appData.notificationSettings;
    if (!settings || !settings.enabled) {
      if (this.isNative) {
        try {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }
        } catch (e) {}
      }
      return;
    }

    if (!this.isNative) return;

    try {
      // Clear previously scheduled notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notificationsToSchedule: ScheduleOptions['notifications'] = [];
      let notificationIdCounter = 1000;

      // 1. Pill Reminders (Daily alarms at exact times)
      if (settings.pillReminders && appData.pills) {
        appData.pills.forEach((pill: Pill) => {
          if (!pill.active) return;
          pill.times.forEach(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              notificationsToSchedule.push({
                id: ++notificationIdCounter,
                title: `💊 Напоминание: ${pill.name}`,
                body: pill.dosage ? `Дозировка: ${pill.dosage}` : 'Пора принять препарат',
                schedule: {
                  on: {
                    hour: hours,
                    minute: minutes
                  },
                  repeats: true,
                  allowWhileIdle: true
                },
                sound: settings.soundEnabled ? 'beep.wav' : undefined,
                actionTypeId: 'PILL_REMINDER',
                extra: { pillId: pill.id }
              });
            }
          });
        });
      }

      // 2. Water Reminders (Every 2 hours from 09:00 to 21:00)
      if (settings.waterReminders) {
        const waterHours = [9, 11, 13, 15, 17, 19, 21];
        waterHours.forEach(hour => {
          notificationsToSchedule.push({
            id: ++notificationIdCounter,
            title: '💧 Водный баланс',
            body: 'Сделайте паузу и выпейте стакан свежей воды!',
            schedule: {
              on: {
                hour: hour,
                minute: 0
              },
              repeats: true,
              allowWhileIdle: true
            },
            sound: settings.soundEnabled ? 'beep.wav' : undefined,
            actionTypeId: 'WATER_REMINDER'
          });
        });
      }

      // 3. Cycle Reminders (Alert N days before predicted menstruation)
      if (settings.cycleReminders && appData.periods && appData.periods.length > 0) {
        const todayStr = getTodayString();
        const prediction = getCyclePrediction(appData.periods, appData.cycleSettings, todayStr);
        if (prediction.nextPeriodStartDate) {
          const nextPeriodObj = parseDateString(prediction.nextPeriodStartDate);
          const daysBefore = settings.cycleReminderDaysBefore ?? 2;
          const reminderDate = new Date(nextPeriodObj.getTime() - daysBefore * 24 * 60 * 60 * 1000);
          reminderDate.setHours(10, 0, 0, 0);

          if (reminderDate.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: ++notificationIdCounter,
              title: '🌸 Календарь цикла',
              body: `Месячные ожидаются примерно через ${daysBefore} ${daysBefore === 1 ? 'день' : 'дня'}.`,
              schedule: {
                at: reminderDate,
                allowWhileIdle: true
              },
              sound: settings.soundEnabled ? 'beep.wav' : undefined,
              actionTypeId: 'CYCLE_REMINDER'
            });
          }
        }
      }

      // 4. Task Reminders
      if (settings.taskReminders && appData.tasks) {
        appData.tasks.forEach(task => {
          if (task.completed || !task.date) return;
          const taskDate = parseDateString(task.date);
          
          if (task.time) {
            const [h, m] = task.time.split(':').map(Number);
            taskDate.setHours(h || 9, m || 0, 0, 0);
          } else {
            taskDate.setHours(9, 30, 0, 0);
          }

          if (taskDate.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: ++notificationIdCounter,
              title: `📝 Задача: ${task.title}`,
              body: task.category ? `Категория: ${task.category}` : 'Не забудьте выполнить задачу',
              schedule: {
                at: taskDate,
                allowWhileIdle: true
              },
              sound: settings.soundEnabled ? 'beep.wav' : undefined,
              actionTypeId: 'TASK_REMINDER'
            });
          }
        });
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log(`[NativeNotifications] Scheduled ${notificationsToSchedule.length} background alarms.`);
      }
    } catch (err) {
      console.warn('Failed to schedule native notifications:', err);
    }
  }
}
