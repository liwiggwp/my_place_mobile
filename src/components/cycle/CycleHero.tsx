import React from 'react';
import type { CyclePrediction, CyclePeriod, DualColorTheme } from '../../types';
import confetti from 'canvas-confetti';
import { Plus, Check, Calendar, Download } from 'lucide-react';

interface CycleHeroProps {
  prediction: CyclePrediction;
  latestPeriod: CyclePeriod | null;
  theme?: DualColorTheme;
  onTogglePeriodToday: () => void;
  onOpenCalendar: () => void;
  onOpenDataImport?: () => void;
}

export const CycleHero: React.FC<CycleHeroProps> = ({
  prediction,
  latestPeriod,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onTogglePeriodToday,
  onOpenCalendar,
  onOpenDataImport
}) => {
  const isPeriodActiveToday = latestPeriod && !latestPeriod.endDate && prediction.currentPhase === 'menstruation';

  const handlePeriodToggle = () => {
    onTogglePeriodToday();
    if (!isPeriodActiveToday) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: [theme.primary, theme.secondary, '#38bdf8']
      });
    }
  };

  const getChanceBadge = () => {
    if (prediction.pregnancyChance === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
          Высокая вероятность зачатия
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        Низкая вероятность зачатия
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 glass-card shadow-lg shadow-slate-200/50">
      {/* Background ambient glow */}
      <div
        style={{ backgroundColor: `${theme.primary}15` }}
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl -z-10 pointer-events-none"
      />
      <div
        style={{ backgroundColor: `${theme.secondary}15` }}
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      {/* Top Header Row with Compact Import Button */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold text-[#595959] uppercase tracking-wider">
          Текущее состояние
        </span>

        {onOpenDataImport && (
          <button
            onClick={onOpenDataImport}
            className="px-2.5 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-[11px] font-bold shadow-2xs border border-slate-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Импорт прошлых дат цикла из P.C. / Flo"
          >
            <Download className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>Импорт</span>
          </button>
        )}
      </div>

      {/* Main Cycle Ring Card */}
      <div className="flex flex-col items-center text-center">
        {/* Ring & Day */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          {/* Animated SVG Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="url(#cycleGrad)"
              strokeWidth="7"
              strokeDasharray={264}
              strokeDashoffset={Math.max(0, 264 - (264 * Math.min(prediction.currentDayOfCycle, 28)) / 28)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.secondary} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: theme.primary }}>
              {prediction.currentPhase === 'menstruation' ? 'Месячные' : 'Цикл'}
            </span>
            <div className="flex items-baseline gap-0.5 my-0.5">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {prediction.currentDayOfCycle}
              </span>
              <span className="text-sm font-semibold text-slate-400">день</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 max-w-[110px] truncate">
              {prediction.phaseName}
            </span>
          </div>
        </div>

        {/* Status / Countdown */}
        <div className="mt-2 space-y-1.5">
          <p className="text-sm font-bold text-slate-700">
            {prediction.currentPhase === 'menstruation'
              ? 'Идет менструация'
              : prediction.daysUntilNextPeriod === 0
              ? 'Месячные ожидаются сегодня'
              : `Следующие месячные через ${prediction.daysUntilNextPeriod} ${
                  prediction.daysUntilNextPeriod === 1 ? 'день' : prediction.daysUntilNextPeriod < 5 ? 'дня' : 'дней'
                }`}
          </p>

          <div className="pt-1">{getChanceBadge()}</div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handlePeriodToggle}
            style={
              isPeriodActiveToday
                ? undefined
                : { background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }
            }
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
              isPeriodActiveToday
                ? 'bg-slate-800 text-white shadow-slate-300/50'
                : 'text-white shadow-slate-300/50'
            }`}
          >
            {isPeriodActiveToday ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Завершить цикл</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Начались месячные</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenCalendar}
            className="py-3 px-4 rounded-2xl font-bold text-xs bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer hover:bg-slate-50"
          >
            <Calendar className="w-4 h-4" style={{ color: theme.primary }} />
            <span>Календарь</span>
          </button>
        </div>
      </div>
    </div>
  );
};
