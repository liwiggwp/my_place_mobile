import React, { useRef } from 'react';
import type { AppData, NotificationSettings } from '../../types';
import {
  Bell,
  Volume2,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Scale,
  Palette,
  Sparkles,
  Pill as PillIcon,
  Droplets,
  CheckSquare
} from 'lucide-react';
import { MyPlaceLogo } from '../common/MyPlaceLogo';
import { UserAvatar } from '../common/UserAvatar';
import { getScreenTheme } from '../../utils/themeUtils';
import { NativeNotificationService } from '../../services/nativeNotificationService';

interface SettingsViewProps {
  appData: AppData;
  notificationPermission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
  onUpdateNotifications: (settings: NotificationSettings) => void;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
  onClearExamplesOnly: () => void;
  onOpenInstallGuide: () => void;
  onOpenWizard: () => void;
  onOpenProfile: () => void;
  onOpenThemeCustomizer: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  notificationPermission,
  onRequestPermission,
  onUpdateNotifications,
  onImportData,
  onResetData,
  onClearExamplesOnly,
  onOpenInstallGuide,
  onOpenWizard,
  onOpenProfile,
  onOpenThemeCustomizer
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const globalTheme = getScreenTheme(appData.themeSettings, 'global');

  const profile = appData.userProfile || {
    name: 'Мой профиль',
    avatarEmoji: 'user',
    goal: 'track_cycle'
  };

  const getGoalTitle = (g: string) => {
    switch (g) {
      case 'track_cycle': return 'Отслеживание цикла';
      case 'plan_pregnancy': return 'Планирование зачатия';
      case 'prevent_pregnancy': return 'Предотвращение беременности';
      default: return 'Здоровье и привычки';
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonString = JSON.stringify(appData, null, 2);
      const fileName = `myplace_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([jsonString], { type: 'application/json' });

      // On iOS Safari & iPadOS: Web Share API file saving
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([blob], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Резервная копия MyPlace',
              text: 'Файл резервной копии данных MyPlace'
            });
            return;
          }
        } catch {
          // If share dialog dismissed, continue to download anchor
        }
      }

      // Download Anchor
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = fileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 500);
    } catch {
      navigator.clipboard?.writeText(JSON.stringify(appData, null, 2));
      alert('Данные скопированы в буфер обмена!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json === 'object') {
          onImportData(json);
          alert('Данные успешно восстановлены из резервной копии MyPlace!');
        } else {
          alert('Некорректный формат файла резервной копии.');
        }
      } catch {
        alert('Ошибка при чтении файла резервной копии.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-5 pb-10">
      {/* Column 1: Profile & Customization */}
      <div className="space-y-4">
        {/* User Profile / Личный кабинет Card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${globalTheme.primary} 0%, ${globalTheme.secondary} 100%)`
          }}
          className="p-5 rounded-3xl text-white shadow-lg shadow-slate-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm">
                <UserAvatar avatarId={profile.avatarEmoji} className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 bg-white/10 px-2 py-0.5 rounded-full">
                  Личный кабинет
                </span>
                <h3 className="font-extrabold text-base leading-tight mt-0.5">{profile.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{getGoalTitle(profile.goal)}</p>
              </div>
            </div>

            <button
              onClick={onOpenProfile}
              style={{ color: globalTheme.primary }}
              className="px-3.5 py-1.5 rounded-xl bg-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer hover:bg-slate-100"
            >
              Настроить
            </button>
          </div>

          {/* Profile Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
            <div className="flex items-center gap-1.5 text-white/90">
              <span>{profile.height ? `Рост: ${profile.height} см` : profile.age ? `Возраст: ${profile.age} лет` : 'Параметры профиля'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 justify-end">
              <Scale className="w-3.5 h-3.5 text-slate-200" />
              <span>{profile.weight ? `${profile.weight} кг` : 'Вес не указан'}</span>
            </div>
          </div>
        </div>

        {/* Theme Customizer Card */}
        <div className="p-4 rounded-3xl glass-card shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${globalTheme.primary}15` }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
            >
              <Palette className="w-5 h-5" style={{ color: globalTheme.primary }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-800">Оформление и Темы</h4>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: globalTheme.primary }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs -ml-1.5" style={{ backgroundColor: globalTheme.secondary }} />
                </div>
              </div>
              <p className="text-[10px] text-[#595959]">Настройка 2 цветов для всего приложения и экранов</p>
            </div>
          </div>

          <button
            onClick={onOpenThemeCustomizer}
            style={{ backgroundColor: globalTheme.primary }}
            className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs active:scale-95 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          >
            Цвета
          </button>
        </div>

        {/* Onboarding Wizard Card */}
        <div className="p-4 rounded-3xl glass-card shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${globalTheme.primary}15` }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            >
              <Sparkles className="w-5 h-5" style={{ color: globalTheme.primary }} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Мастер быстрой настройки</h4>
              <p className="text-[10px] text-[#595959]">Пошаговый мастер: цикл, вода и лекарства</p>
            </div>
          </div>

          <button
            onClick={onOpenWizard}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs active:scale-95 cursor-pointer hover:bg-slate-200"
          >
            Запустить
          </button>
        </div>

        {/* Install App Banner */}
        <div className="p-4 rounded-3xl glass-card shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center p-1.5">
              <MyPlaceLogo
                className="w-7 h-7"
                primaryColor={globalTheme.primary}
                secondaryColor={globalTheme.secondary}
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Установка на iPad / iPhone</h4>
              <p className="text-[10px] text-[#595959]">На весь экран без браузера и офлайн</p>
            </div>
          </div>

          <button
            onClick={onOpenInstallGuide}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs active:scale-95 cursor-pointer hover:bg-slate-200"
          >
            Гид
          </button>
        </div>
      </div>

      {/* Column 2: Notifications, Privacy & Data */}
      <div className="space-y-4">
        {/* Notifications Management */}
        <div className="p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${globalTheme.primary}15`, color: globalTheme.primary }}
              className="p-2 rounded-xl"
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Уведомления на iPhone</h3>
              <p className="text-[11px] text-[#595959]">
                {notificationPermission === 'granted'
                  ? 'Уведомления разрешены'
                  : 'Требуется разрешение'}
              </p>
            </div>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={onRequestPermission}
              style={{ backgroundColor: globalTheme.primary }}
              className="px-3 py-1.5 rounded-xl text-white font-bold text-xs active:scale-95 shadow-xs cursor-pointer hover:opacity-90"
            >
              Включить
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Sounds */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span>Звуки и сигналы</span>
            </div>
            <button
              onClick={() =>
                onUpdateNotifications({
                  ...appData.notificationSettings,
                  soundEnabled: !appData.notificationSettings.soundEnabled
                })
              }
              style={appData.notificationSettings.soundEnabled ? { backgroundColor: globalTheme.primary } : undefined}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                appData.notificationSettings.soundEnabled ? 'justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Pill Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <PillIcon className="w-4 h-4 text-purple-600" />
              <span>Напоминания о таблетках</span>
            </div>
            <button
              onClick={() =>
                onUpdateNotifications({
                  ...appData.notificationSettings,
                  pillReminders: !appData.notificationSettings.pillReminders
                })
              }
              style={appData.notificationSettings.pillReminders ? { backgroundColor: globalTheme.primary } : undefined}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                appData.notificationSettings.pillReminders ? 'justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Water Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Напоминания пить воду</span>
            </div>
            <button
              onClick={() =>
                onUpdateNotifications({
                  ...appData.notificationSettings,
                  waterReminders: !appData.notificationSettings.waterReminders
                })
              }
              style={appData.notificationSettings.waterReminders ? { backgroundColor: globalTheme.primary } : undefined}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                appData.notificationSettings.waterReminders ? 'justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Task Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Напоминания о задачах</span>
            </div>
            <button
              onClick={() =>
                onUpdateNotifications({
                  ...appData.notificationSettings,
                  taskReminders: appData.notificationSettings.taskReminders === false ? true : false
                })
              }
              style={appData.notificationSettings.taskReminders !== false ? { backgroundColor: globalTheme.primary } : undefined}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                appData.notificationSettings.taskReminders !== false ? 'justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Test Background Notification Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={async () => {
                const scheduled = await NativeNotificationService.scheduleTestNotification();
                if (scheduled) {
                  alert('🔔 Тест запущен!\n\nСверните приложение или заблокируйте телефон прямо сейчас — ровно через 5 секунд придет звуковое уведомление.');
                }
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5" style={{ color: globalTheme.primary }} />
              <span>Проверить фоновое уведомление (5 сек)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Backup */}
      <div className="p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Приватность и Резервная копия</h3>
            <p className="text-[11px] text-[#595959]">100% данных хранятся только на телефоне</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer hover:bg-slate-100"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Экспорт JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer hover:bg-slate-100"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Импорт JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        <button
          onClick={onClearExamplesOnly}
          className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer hover:bg-slate-200"
        >
          <span>Очистить примеры (начать с чистого листа)</span>
        </button>

        <button
          onClick={onResetData}
          className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer hover:bg-rose-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Сброс до заводских настроек</span>
        </button>
      </div>
      </div>
    </div>
  );
};
