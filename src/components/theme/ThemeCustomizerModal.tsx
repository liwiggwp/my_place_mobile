import React, { useState, useEffect } from 'react';
import type { AppThemeSettings, DualColorTheme } from '../../types';
import { defaultThemeSettings, THEME_PRESETS } from '../../utils/themeUtils';
import { X, Check, RotateCcw, Palette, Sparkles, Globe, Heart, CheckSquare, Droplets, Pill as PillIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MyPlaceLogo } from '../common/MyPlaceLogo';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  themeSettings?: AppThemeSettings;
  onSaveThemeSettings: (settings: AppThemeSettings) => void;
  onClose: () => void;
}

type ScreenTarget = 'global' | 'cycle' | 'tasks' | 'water' | 'pills';

const QUICK_COLORS = [
  '#203A5F', '#595959', '#1E3A8A', '#0284C7',
  '#047857', '#10B981', '#BE123C', '#FB7185',
  '#6D28D9', '#A855F7', '#C2410C', '#FB923C',
  '#0F172A', '#475569', '#451A03', '#831843'
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  themeSettings,
  onSaveThemeSettings,
  onClose
}) => {
  const [activeTarget, setActiveTarget] = useState<ScreenTarget>('global');
  const [localSettings, setLocalSettings] = useState<AppThemeSettings>(
    themeSettings || defaultThemeSettings
  );

  useEffect(() => {
    if (themeSettings) {
      setLocalSettings(themeSettings);
    } else {
      setLocalSettings(defaultThemeSettings);
    }
  }, [themeSettings, isOpen]);

  if (!isOpen) return null;

  const isGlobal = activeTarget === 'global';
  const hasCustomOverride = !isGlobal && !!localSettings[activeTarget];

  const currentTheme: DualColorTheme = isGlobal
    ? localSettings.global
    : (localSettings[activeTarget] || localSettings.global);

  const handleUpdateCurrentPrimary = (primary: string) => {
    if (isGlobal) {
      setLocalSettings(prev => ({
        ...prev,
        global: { ...prev.global, primary }
      }));
    } else {
      const existing = localSettings[activeTarget] || localSettings.global;
      setLocalSettings(prev => ({
        ...prev,
        [activeTarget]: { ...existing, primary }
      }));
    }
  };

  const handleUpdateCurrentSecondary = (secondary: string) => {
    if (isGlobal) {
      setLocalSettings(prev => ({
        ...prev,
        global: { ...prev.global, secondary }
      }));
    } else {
      const existing = localSettings[activeTarget] || localSettings.global;
      setLocalSettings(prev => ({
        ...prev,
        [activeTarget]: { ...existing, secondary }
      }));
    }
  };

  const handleToggleCustomOverride = () => {
    if (isGlobal) return;
    if (hasCustomOverride) {
      setLocalSettings(prev => ({
        ...prev,
        [activeTarget]: undefined
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [activeTarget]: { ...prev.global }
      }));
    }
  };

  const handleApplyPreset = (primary: string, secondary: string) => {
    if (isGlobal) {
      setLocalSettings(prev => ({
        ...prev,
        global: { primary, secondary }
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [activeTarget]: { primary, secondary }
      }));
    }
  };

  const handleResetToDefault = () => {
    setLocalSettings(defaultThemeSettings);
  };

  const handleSave = () => {
    onSaveThemeSettings(localSettings);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClose();
  };

  const targets: { id: ScreenTarget; label: string; icon: React.ReactNode }[] = [
    { id: 'global', label: 'Всё', icon: <Globe className="w-4 h-4" /> },
    { id: 'cycle', label: 'Цикл', icon: <Heart className="w-4 h-4" /> },
    { id: 'tasks', label: 'Задачи', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'water', label: 'Вода', icon: <Droplets className="w-4 h-4" /> },
    { id: 'pills', label: 'Таблетки', icon: <PillIcon className="w-4 h-4" /> }
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
              <Palette className="w-5 h-5 text-[#203A5F]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Оформление и Темы</h3>
              <p className="text-xs text-[#203A5F] font-semibold">Настройка 2 цветов для экранов</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-3.5 space-y-4">
          {/* Target Tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl">
            {targets.map(t => {
              const isSelected = activeTarget === t.id;
              const hasOverride = t.id !== 'global' && !!localSettings[t.id];

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTarget(t.id)}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 relative cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-[#595959] hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-[11px] font-semibold leading-tight truncate w-full">{t.label}</span>
                  {hasOverride && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#203A5F] absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-Screen Override Toggle */}
          {!isGlobal && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {hasCustomOverride ? 'Своя тема экрана' : 'Тема всего приложения'}
                </p>
                <p className="text-[10px] text-[#595959] truncate">
                  {hasCustomOverride ? 'Для этого экрана заданы свои цвета' : 'Используются общие цвета'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleCustomOverride}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  hasCustomOverride
                    ? 'bg-[#203A5F] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {hasCustomOverride ? 'Своя тема' : 'Из общего'}
              </button>
            </div>
          )}

          {/* Live Preview Card (Target Specific) */}
          {(() => {
            const previewConfig = {
              global: {
                title: 'MyPlace • Главный экран',
                subtitle: 'Общая палитра приложения и виджетов',
                badge: 'Все виджеты и навигация'
              },
              cycle: {
                title: '14 день цикла • Овуляция',
                subtitle: 'Фаза цикла и прогноз фертильности',
                badge: 'Высокая вероятность зачатия'
              },
              tasks: {
                title: '3 из 4 задач выполнено (75%)',
                subtitle: 'Планирование на день, неделю и месяц',
                badge: '09:00 Разминка • Высокий приоритет'
              },
              water: {
                title: '1 500 / 2 000 мл (75%)',
                subtitle: 'Трекер водного баланса и напоминания',
                badge: 'Выпито 6 из 8 стаканов воды'
              },
              pills: {
                title: 'Витамин D3 • 2000 ME',
                subtitle: 'Расписание и напоминания о приеме',
                badge: 'Принято сегодня в 09:00'
              }
            }[activeTarget];

            return (
              <div
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`
                }}
                className="p-5 rounded-3xl text-white shadow-lg shadow-slate-300 transition-all space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <MyPlaceLogo className="w-6 h-6" primaryColor="#ffffff" secondaryColor="#e2e8f0" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {isGlobal ? 'Тема всего приложения' : `Экран «${targets.find(t => t.id === activeTarget)?.label}»`}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-white/80" />
                </div>

                <div className="pt-2 relative z-10">
                  <h4 className="text-xl font-black">{previewConfig.title}</h4>
                  <p className="text-xs text-white/80 mt-0.5">{previewConfig.subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[10px] font-bold text-white/90 relative z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-white/25 backdrop-blur-md border border-white/20">
                    {previewConfig.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/15">
                    {currentTheme.primary} • {currentTheme.secondary}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Dual Color Selectors */}
          <div className="grid grid-cols-2 gap-3">
            {/* Color 1: Primary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800">Цвет 1 (Основной)</label>
                <div
                  className="w-4 h-4 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: currentTheme.primary }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={currentTheme.primary}
                  onChange={e => handleUpdateCurrentPrimary(e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 p-0 cursor-pointer bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.primary}
                  onChange={e => handleUpdateCurrentPrimary(e.target.value)}
                  className="w-full min-w-0 px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase text-slate-800 text-center focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Quick Circles */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {QUICK_COLORS.slice(0, 8).map(c => {
                  const isSelected = currentTheme.primary.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateCurrentPrimary(c)}
                      style={{ backgroundColor: c }}
                      className={`h-6 rounded-lg transition-transform active:scale-90 cursor-pointer ${
                        isSelected
                          ? 'border-2 border-slate-900 shadow-xs'
                          : 'border border-black/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Color 2: Secondary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800">Цвет 2 (Градиент)</label>
                <div
                  className="w-4 h-4 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: currentTheme.secondary }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={currentTheme.secondary}
                  onChange={e => handleUpdateCurrentSecondary(e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 p-0 cursor-pointer bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.secondary}
                  onChange={e => handleUpdateCurrentSecondary(e.target.value)}
                  className="w-full min-w-0 px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase text-slate-800 text-center focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Quick Circles */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {QUICK_COLORS.slice(8, 16).map(c => {
                  const isSelected = currentTheme.secondary.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateCurrentSecondary(c)}
                      style={{ backgroundColor: c }}
                      className={`h-6 rounded-lg transition-transform active:scale-90 cursor-pointer ${
                        isSelected
                          ? 'border-2 border-slate-900 shadow-xs'
                          : 'border border-black/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Curated Presets Bar */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">Готовые палитры:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.primary, preset.secondary)}
                  className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all active:scale-95 flex flex-col justify-between gap-1.5 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs -ml-2"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight truncate w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-3 rounded-2xl bg-slate-100 text-[#595959] font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer hover:bg-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-[#203A5F] hover:bg-[#1a2f4d] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Применить тему</span>
          </button>
        </div>
      </div>
    </div>
  );
};
