import React from 'react';
import type { Pill, PillLog, DualColorTheme } from '../../types';
import { getTodayString } from '../../utils/dateUtils';
import { Plus, CheckCircle2 } from 'lucide-react';

interface PillSummaryProps {
  pills: Pill[];
  logs: PillLog[];
  theme?: DualColorTheme;
  onOpenAddModal: () => void;
}

export const PillSummary: React.FC<PillSummaryProps> = ({
  pills,
  logs,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onOpenAddModal
}) => {
  const todayStr = getTodayString();
  const activePills = pills.filter(p => p.active);

  let totalScheduledToday = 0;
  let takenCount = 0;

  activePills.forEach(pill => {
    pill.times.forEach(time => {
      totalScheduledToday++;
      const isTaken = logs.some(
        l => l.pillId === pill.id && l.date === todayStr && l.scheduledTime === time && l.status === 'taken'
      );
      if (isTaken) takenCount++;
    });
  });

  const progressPercent = totalScheduledToday > 0 ? Math.round((takenCount / totalScheduledToday) * 100) : 100;

  return (
    <div className="p-5 rounded-3xl glass-card shadow-sm border border-slate-200/80 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
            Сегодня • Прогресс
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-extrabold text-slate-800">
              {takenCount} из {totalScheduledToday}
            </h3>
            <span className="text-xs font-semibold text-slate-500">принято</span>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md shadow-slate-300 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-semibold">
          <span>{progressPercent}% выполнено</span>
          {takenCount === totalScheduledToday && totalScheduledToday > 0 ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Все выпито на сегодня!
            </span>
          ) : (
            <span>Осталось принять: {totalScheduledToday - takenCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};
