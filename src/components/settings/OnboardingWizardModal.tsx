import React, { useState } from 'react';
import type { AppData, CyclePeriod, Pill, PillCategory } from '../../types';
import { getTodayString, addDays } from '../../utils/dateUtils';
import { X, Check, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: (data: Partial<AppData>) => void;
  onClose: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Cycle
  const [lastPeriodStart, setLastPeriodStart] = useState(addDays(getTodayString(), -10));
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);

  // Step 2: Pills / Vitamins
  const [pillsList, setPillsList] = useState<{ name: string; dosage: string; time: string; category: PillCategory }[]>([
    { name: '', dosage: '1 табл.', time: '09:00', category: 'vitamin' }
  ]);

  // Step 3: Water
  const [userWeight, setUserWeight] = useState<string>('55');
  const [customGoal, setCustomGoal] = useState(2000);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [waterInterval, setWaterInterval] = useState(2);
  const [waterStartTime, setWaterStartTime] = useState('08:30');
  const [waterEndTime, setWaterEndTime] = useState('22:00');

  if (!isOpen) return null;

  const handleWeightChange = (val: string) => {
    setUserWeight(val);
    const weightNum = parseFloat(val);
    if (!isNaN(weightNum) && weightNum > 30 && weightNum < 200 && autoCalculate) {
      const calculated = Math.round((weightNum * 35) / 50) * 50;
      setCustomGoal(calculated);
    }
  };

  const handleAddPillRow = () => {
    setPillsList(prev => [...prev, { name: '', dosage: '1 табл.', time: '21:00', category: 'pill' }]);
  };

  const handleRemovePillRow = (idx: number) => {
    setPillsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePillChange = (idx: number, field: string, value: string) => {
    setPillsList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleFinish = () => {
    const newPeriods: CyclePeriod[] = [
      {
        id: 'p-' + Date.now(),
        startDate: lastPeriodStart,
        endDate: addDays(lastPeriodStart, periodDuration - 1),
        length: periodDuration
      }
    ];

    const formattedPills: Pill[] = pillsList
      .filter(p => p.name.trim().length > 0)
      .map((p, idx) => ({
        id: 'pill-' + (Date.now() + idx),
        name: p.name.trim(),
        dosage: p.dosage.trim() || '1 табл.',
        category: p.category,
        times: [p.time],
        scheduleType: 'everyday',
        color: idx % 2 === 0 ? '#8b5cf6' : '#f59e0b',
        active: true,
        createdAt: new Date().toISOString()
      }));

    onComplete({
      periods: newPeriods,
      cycleSettings: {
        averageCycleLength: cycleLength,
        averagePeriodLength: periodDuration,
        lutealPhaseLength: 14
      },
      pills: formattedPills,
      waterSettings: {
        dailyGoal: customGoal,
        reminderIntervalHours: waterInterval,
        reminderStartTime: waterStartTime,
        reminderEndTime: waterEndTime,
        enabledReminders: true,
        glassSize: 250
      }
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header with Progress */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Шаг {step} из 3
            </span>
            <h3 className="font-extrabold text-slate-800 text-base">
              {step === 1 && 'Настройка цикла'}
              {step === 2 && 'Ваши таблетки и витамины'}
              {step === 3 && 'Норма и напоминания воды'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex gap-1.5 my-3 shrink-0">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-sky-500' : 'bg-slate-200'}`} />
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-2 space-y-4">
          {/* STEP 1: CYCLE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Дата начала последних месячных
                </label>
                <input
                  type="date"
                  value={lastPeriodStart}
                  onChange={e => setLastPeriodStart(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Длина цикла (дней)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={e => setCycleLength(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Обычно 28 дней</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Длительность (дней)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={periodDuration}
                    onChange={e => setPeriodDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Обычно 4–6 дней</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs leading-relaxed border border-rose-100">
                Календарь автоматически рассчитает дни овуляции, окно фертильности и дату следующих месячных.
              </div>
            </div>
          )}

          {/* STEP 2: PILLS */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Добавьте лекарства, витамины или КОК, которые вы принимаете:
                </p>
                <button
                  onClick={handleAddPillRow}
                  className="text-xs font-bold text-purple-600 flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить еще
                </button>
              </div>

              {pillsList.map((pill, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600">Препарат #{idx + 1}</span>
                    {pillsList.length > 1 && (
                      <button
                        onClick={() => handleRemovePillRow(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Название (например: Витамин D3, Джес, Железо)"
                    value={pill.name}
                    onChange={e => handlePillChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 transition-colors"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Дозировка (1 табл.)"
                      value={pill.dosage}
                      onChange={e => handlePillChange(idx, 'dosage', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                    />

                    <input
                      type="time"
                      value={pill.time}
                      onChange={e => handlePillChange(idx, 'time', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              ))}

              <p className="text-[11px] text-slate-400 italic">
                * Если сейчас ничего не принимаете, можете оставить поле пустым и нажать «Далее».
              </p>
            </div>
          )}

          {/* STEP 3: WATER */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                <label className="block text-xs font-bold text-sky-900 mb-1">
                  Калькулятор суточной нормы по весу
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Ваш вес (кг)"
                    value={userWeight}
                    onChange={e => handleWeightChange(e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <span className="text-xs font-semibold text-slate-600">кг</span>
                  <span className="text-xs font-bold text-sky-700 ml-auto">
                    ≈ {customGoal} мл/день
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Точная дневная цель (мл)
                </label>
                <input
                  type="number"
                  step="50"
                  value={customGoal}
                  onChange={e => {
                    setAutoCalculate(false);
                    setCustomGoal(Number(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Интервал напоминаний
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 1.5, 2, 3].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setWaterInterval(h)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        waterInterval === h
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Каждые {h}ч
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">С какого часа</label>
                  <input
                    type="time"
                    value={waterStartTime}
                    onChange={e => setWaterStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">До какого часа</label>
                  <input
                    type="time"
                    value={waterEndTime}
                    onChange={e => setWaterEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer hover:bg-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 active:scale-95 ml-auto cursor-pointer"
            >
              <span>Далее</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 active:scale-95 ml-auto cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить всё</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
