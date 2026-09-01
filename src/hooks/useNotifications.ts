import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationSettings, Pill, PillLog, WaterSettings, TaskItem } from '../types';
import { getTodayString } from '../utils/dateUtils';

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

  const notifiedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Уведомления не поддерживаются вашим браузером. На iPhone добавьте приложение на экран «Домой» (Safari iOS 16.4+) для поддержки уведомлений.');
      return false;
    }

    try {
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
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  };

  const sendNotification = useCallback(
    async (
      title: string,
      body: string,
      icon: string = '/favicon.svg',
      type: 'pill' | 'water' | 'cycle' | 'task' | 'info' = 'info'
    ) => {
      // 1. Play sound chime
      playChimeSound();

      // 2. Always show rich in-app banner
      setActiveAlert({
        id: Math.random().toString(36).substring(2, 9),
        title,
        body,
        type
      });

      // 3. Play vibration if supported
      if (typeof window !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([150, 80, 150]);
        } catch (e) {
          // ignore
        }
      }

      // 4. System Push / Desktop / Lockscreen Notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
              await reg.showNotification(title, {
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

      // 1. Check Task Reminders
      if (!settings || settings.taskReminders !== false) {
        tasks.forEach(task => {
          if (task.date === todayStr && task.time && !task.completed) {
            const timeParts = task.time.split(':').map(Number);
            if (timeParts.length === 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
              const taskH = timeParts[0];
              const taskM = timeParts[1];
              const reminderAdvance = task.reminderMinutesBefore || 0;
              const taskTimeInMinutes = taskH * 60 + taskM;
              const triggerTimeInMinutes = taskTimeInMinutes - reminderAdvance;

              // Check if current minute matches trigger minute
              if (currentTimeInMinutes === triggerTimeInMinutes) {
                const notifyKey = `${task.id}-${todayStr}-${task.time}-${triggerTimeInMinutes}`;
                if (!notifiedTasksRef.current.has(notifyKey)) {
                  notifiedTasksRef.current.add(notifyKey);

                  const titleText = reminderAdvance > 0
                    ? `🔔 Скоро: ${task.title}`
                    : `📋 Время задачи: ${task.title}`;

                  const bodyText = reminderAdvance > 0
                    ? `Начало через ${reminderAdvance} мин (в ${task.time}). ${task.description || ''}`
                    : task.description || 'Пора приступить к выполнению задачи!';

                  sendNotification(
                    titleText,
                    bodyText,
                    '/favicon.svg',
                    'task'
                  );
                }
              }
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
              if (!notifiedTasksRef.current.has(notifyKey)) {
                notifiedTasksRef.current.add(notifyKey);
                sendNotification(
                  `💊 Время принять: ${pill.name}`,
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
            if (!notifiedTasksRef.current.has(notifyKey)) {
              notifiedTasksRef.current.add(notifyKey);
              sendNotification(
                '💧 Пора выпить воды!',
                'Сделайте пару глотков чистой воды для поддержания баланса и энергии',
                '/favicon.svg',
                'water'
              );
            }
          }
        }
      }
    };

    // Run check immediately and then every 2 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 2000);

    return () => clearInterval(interval);
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
