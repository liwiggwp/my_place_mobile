import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationSettings, Pill, PillLog, WaterSettings, TaskItem } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { NativeNotificationService } from '../services/nativeNotificationService';

// Helper for playing pleasant chime using Web Audio API
function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone (pleasant harmonic)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Second tone (higher harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    // audio context might be blocked if no user interaction yet
  }
}

// Persistent key tracker stored in localStorage
function loadNotifiedKeys(): Set<string> {
  try {
    const saved = localStorage.getItem('myplace_notified_keys_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const today = getTodayString();
        const todayKeys = parsed.filter((k: string) => k.includes(today));
        return new Set(todayKeys);
      }
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

function saveNotifiedKeys(keys: Set<string>) {
  try {
    localStorage.setItem('myplace_notified_keys_v3', JSON.stringify(Array.from(keys)));
  } catch (e) {
    // ignore
  }
}

export function useNotifications(
  settings: NotificationSettings = {
    enabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    pillReminders: true,
    waterReminders: true,
    taskReminders: true,
    cycleReminders: true,
    cycleReminderDaysBefore: 2
  },
  pills: Pill[] = [],
  pillLogs: PillLog[] = [],
  waterSettings: WaterSettings = {
    dailyGoal: 2000,
    reminderIntervalHours: 2,
    reminderStartTime: '08:30',
    reminderEndTime: '22:00',
    enabledReminders: true,
    glassSize: 250
  },
  tasks: TaskItem[] = []
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
    type: 'pill' | 'water' | 'cycle' | 'task' | 'info';
  } | null>(null);

  const notifiedKeysRef = useRef<Set<string>>(loadNotifiedKeys());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const nativeGranted = await NativeNotificationService.requestPermissions();
      if (nativeGranted) {
        setPermission('granted');
        sendNotification(
          'MyPlace: Уведомления включены',
          'Теперь вы будете получать звуковые и системные напоминания о задачах и воде!',
          '/favicon.svg',
          'info'
        );
        return true;
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
          sendNotification(
            'MyPlace: Уведомления включены',
            'Теперь вы будете получать звуковые и системные напоминания о задачах и воде!',
            '/favicon.svg',
            'info'
          );
        }
        return result === 'granted';
      }

      alert('Уведомления не поддерживаются вашим браузером. На iPhone добавьте приложение на экран «Домой» (Safari iOS 16.4+) для поддержки системных уведомлений.');
      return false;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  };

  const sendNotification = useCallback(
    (
      title: string,
      body: string,
      icon: string = '/favicon.svg',
      type: 'pill' | 'water' | 'cycle' | 'task' | 'info' = 'info'
    ) => {
      // 1. Play sound chime
      if (!settings || settings.soundEnabled !== false) {
        playChimeSound();
      }

      // 2. Always show in-app banner immediately
      setActiveAlert({
        id: Math.random().toString(36).substring(2, 9),
        title,
        body,
        type
      });

      // 3. Play vibration if supported
      if (typeof window !== 'undefined' && navigator.vibrate && (!settings || settings.vibrateEnabled !== false)) {
        try {
          navigator.vibrate([150, 80, 150]);
        } catch (e) {
          // ignore
        }
      }

      // 4. System / Desktop / Push Notification (non-blocking)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: icon || '/favicon.svg'
          });
        } catch (err) {
          try {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistration().then(reg => {
                if (reg && reg.showNotification) {
                  reg.showNotification(title, {
                    body,
                    icon: icon || '/favicon.svg',
                    badge: '/favicon.svg',
                    vibrate: [200, 100, 200]
                  } as NotificationOptions);
                }
              }).catch(() => {});
            }
          } catch (e) {
            console.warn('Could not display system notification:', e);
          }
        }
      }
    },
    [settings]
  );

  const testNotification = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        sendNotification(
          'MyPlace: Внутреннее уведомление',
          'Системные уведомления заблокированы в браузере. Разрешите их в настройках сайта для Push-уведомлений.',
          '/favicon.svg',
          'info'
        );
        return;
      }
    }
    sendNotification(
      'MyPlace: Тестовое напоминание',
      'Звук и уведомления работают отлично!',
      '/favicon.svg',
      'info'
    );
  };

  useEffect(() => {
    // If explicitly disabled in settings
    if (settings && settings.enabled === false) return;

    const checkReminders = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeInMinutes = currentH * 60 + currentM;
      const todayStr = getTodayString();

      const hours = String(currentH).padStart(2, '0');
      const minutes = String(currentM).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      let hasNewNotifiedKey = false;

      // 1. Check Task Reminders & Overdue Tasks
      if (!settings || settings.taskReminders !== false) {
        tasks.forEach(task => {
          if (task.completed) return;

          // Process timed tasks for today
          if (task.date === todayStr && task.time) {
            const timeParts = task.time.split(':').map(Number);
            if (timeParts.length === 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
              const taskH = timeParts[0];
              const taskM = timeParts[1];
              const taskTimeInMinutes = taskH * 60 + taskM;
              const reminderAdvance = task.reminderMinutesBefore || 0;

              // A1. Advance Reminder (e.g. 5, 10, 15, 30, 60 minutes before)
              if (reminderAdvance > 0) {
                const advanceTriggerTime = taskTimeInMinutes - reminderAdvance;
                if (currentTimeInMinutes >= advanceTriggerTime && currentTimeInMinutes < taskTimeInMinutes) {
                  const advanceKey = `task-adv-${task.id}-${todayStr}-${task.time}-${reminderAdvance}`;
                  if (!notifiedKeysRef.current.has(advanceKey)) {
                    notifiedKeysRef.current.add(advanceKey);
                    hasNewNotifiedKey = true;

                    sendNotification(
                      `Скоро: ${task.title}`,
                      `Начало через ${reminderAdvance} мин (в ${task.time}). ${task.description || ''}`,
                      '/favicon.svg',
                      'task'
                    );
                  }
                }
              }

              // A2. Exact Time Reminder (always fires at task.time)
              if (currentTimeInMinutes >= taskTimeInMinutes && currentTimeInMinutes <= taskTimeInMinutes + 5) {
                const exactKey = `task-exact-${task.id}-${todayStr}-${task.time}`;
                if (!notifiedKeysRef.current.has(exactKey)) {
                  notifiedKeysRef.current.add(exactKey);
                  hasNewNotifiedKey = true;

                  sendNotification(
                    `Время задачи: ${task.title}`,
                    task.description ? `${task.description} (запланировано на ${task.time})` : `Пора выполнить задачу (в ${task.time})!`,
                    '/favicon.svg',
                    'task'
                  );
                }
              }
            }
          }

          // B. Overdue Tasks Alert (Просроченные задачи)
          const isPastDate = task.date < todayStr;
          const isPastTimeToday =
            task.date === todayStr &&
            !!task.time &&
            (() => {
              const parts = task.time.split(':').map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const taskMin = parts[0] * 60 + parts[1];
                // Flag overdue if past the task time + 2 minutes grace period
                return currentTimeInMinutes > taskMin + 2;
              }
              return false;
            })();

          if (isPastDate || isPastTimeToday) {
            const overdueKey = `task-overdue-${task.id}-${task.date}-${task.time || 'notime'}-${todayStr}`;
            if (!notifiedKeysRef.current.has(overdueKey)) {
              notifiedKeysRef.current.add(overdueKey);
              hasNewNotifiedKey = true;

              sendNotification(
                `Просрочена задача: ${task.title}`,
                `Срок выполнения истёк (${task.date === todayStr ? 'в ' + task.time : task.date}). Не забудьте завершить или перенести её.`,
                '/favicon.svg',
                'task'
              );
            }
          }
        });
      }

      // 2. Check Pill Reminders
      if (!settings || settings.pillReminders) {
        pills.filter(p => p.active).forEach(pill => {
          if (pill.times.includes(currentTimeStr)) {
            const alreadyLogged = pillLogs.some(
              log => log.pillId === pill.id && log.date === todayStr && log.scheduledTime === currentTimeStr && log.status === 'taken'
            );

            if (!alreadyLogged) {
              const notifyKey = `pill-${pill.id}-${todayStr}-${currentTimeStr}`;
              if (!notifiedKeysRef.current.has(notifyKey)) {
                notifiedKeysRef.current.add(notifyKey);
                hasNewNotifiedKey = true;

                sendNotification(
                  `Время принять: ${pill.name}`,
                  `Дозировка: ${pill.dosage}. Не забудьте отметить в приложении!`,
                  '/favicon.svg',
                  'pill'
                );
              }
            }
          }
        });
      }

      // 3. Check Water Reminders
      if (settings?.waterReminders && waterSettings?.enabledReminders) {
        const [startH] = (waterSettings.reminderStartTime || '08:30').split(':').map(Number);
        const [endH] = (waterSettings.reminderEndTime || '22:00').split(':').map(Number);

        if (currentH >= startH && currentH <= endH && minutes === '00') {
          if (currentH % Math.max(1, Math.round(waterSettings.reminderIntervalHours || 2)) === 0) {
            const notifyKey = `water-${todayStr}-${currentH}`;
            if (!notifiedKeysRef.current.has(notifyKey)) {
              notifiedKeysRef.current.add(notifyKey);
              hasNewNotifiedKey = true;

              sendNotification(
                'Пора выпить воды!',
                'Сделайте пару глотков чистой воды для поддержания баланса и энергии',
                '/favicon.svg',
                'water'
              );
            }
          }
        }
      }

      if (hasNewNotifiedKey) {
        saveNotifiedKeys(notifiedKeysRef.current);
      }
    };

    // Run check immediately and every 1 second
    checkReminders();
    const interval = setInterval(checkReminders, 1000);

    const handleVisibilityOrFocus = () => {
      checkReminders();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [settings, pills, pillLogs, waterSettings, tasks, sendNotification]);

  return {
    permission,
    requestPermission,
    sendNotification,
    testNotification,
    activeAlert,
    dismissAlert: () => setActiveAlert(null)
  };
}
