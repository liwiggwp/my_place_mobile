import React, { useState } from 'react';
import type { WaterSettings } from '../../types';
import { X, Check, Droplets, Bell, Clock } from 'lucide-react';

interface WaterGoalModalProps {
  isOpen: boolean;
  settings: WaterSettings;
  onSave: (newSettings: WaterSettings) => void;
  onClose: () => void;
}

export const WaterGoalModal: React.FC<WaterGoalModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose
}) => {
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 2000);
  const [reminderIntervalHours, setReminderIntervalHours] = useState(settings.reminderIntervalHours || 2);
  const [enabledReminders, setEnabledReminders] = useState(settings.enabledReminders ?? true);
  const [startTime, setStartTime] = useState(settings.reminderStartTime || '08:00');
  const [endTime, setEndTime] = useState(settings.reminderEndTime || '22:00');

  if (!isOpen) return null;

  const goalPresets = [1500, 1800, 2000, 2200, 2500, 3000];
  const intervalPresets = [1, 1.5, 2, 3];

  const handleSave = () => {
    onSave({
      ...settings,
      dailyGoal,
      reminderIntervalHours,
      enabledReminders,
      reminderStartTime: startTime,
      reminderEndTime: endTime
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-sky-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Настройка водного баланса</h3>
            <p className="text-xs text-sky-500 font-semibold">Дневная цель и напоминания</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 transition-transform cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-4 space-y-5">
          {/* Daily Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Дневная норма воды (мл)</span>
            </label>

            <div className="grid grid-cols-3 gap-2 mb-2">
              {goalPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDailyGoal(preset)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    dailyGoal === preset
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset} мл
                </button>
              ))}
            </div>

            <input
              type="number"
              min="500"
              max="5000"
              step="50"
              value={dailyGoal}
              onChange={e => setDailyGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Reminders Toggle */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-sky-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Напоминания пить воду</p>
                <p className="text-[11px] text-slate-500">Уведомлять в течение дня</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnabledReminders(!enabledReminders)}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                enabledReminders ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Reminders Interval & Quiet hours */}
          {enabledReminders && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Интервал напоминаний
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {intervalPresets.map(hrs => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setReminderIntervalHours(hrs)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                        reminderIntervalHours === hrs
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Каждые {hrs}ч
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> С какого часа
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> До какого часа
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-300/40 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Сохранить настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};
