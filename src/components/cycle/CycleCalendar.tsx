import React, { useState } from 'react';
import type { CyclePeriod, CycleSettings, DayLog } from '../../types';
import { getMonthMatrix, getTodayString, parseDateString } from '../../utils/dateUtils';
import { getDateStatus } from '../../utils/cycleCalculations';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CycleCalendarProps {
  periods: CyclePeriod[];
  settings: CycleSettings;
  dayLogs: Record<string, DayLog>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onOpenSymptomModal: (dateStr: string) => void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  periods,
  settings,
  dayLogs,
  selectedDate,
  onSelectDate,
  onOpenSymptomModal
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = parseDateString(getTodayString());
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const prevMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const matrix = getMonthMatrix(currentDate.year, currentDate.month);
  const todayStr = getTodayString();

  return (
    <div className="rounded-3xl p-5 glass-card shadow-sm">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl bg-rose-50 text-rose-600 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-800">
          {monthNames[currentDate.month]} {currentDate.year}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl bg-rose-50 text-rose-600 active:scale-90 transition-transform"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((d, i) => (
          <span
            key={d}
            className={`text-[11px] font-bold ${
              i >= 5 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {matrix.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map(day => {
              const status = getDateStatus(day.dateStr, periods, settings);
              const isSelected = selectedDate === day.dateStr;
              const isTodayDate = todayStr === day.dateStr;
              const dayLog = dayLogs[day.dateStr];
              
              const hasIntimacy = dayLog?.intimacy?.hadSex || (dayLog?.sexActivity && dayLog?.sexActivity !== 'none');
              const hasSymptoms = dayLog && (dayLog.moods?.length > 0 || dayLog.symptoms?.length > 0 || dayLog.notes);

              let bgClasses = 'bg-transparent text-slate-700 hover:bg-rose-50/50';

              if (status.isPeriod) {
                bgClasses = 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-300';
              } else if (status.isPredictedPeriod) {
                bgClasses = 'border-2 border-dashed border-rose-400 text-rose-600 bg-rose-50/60 font-semibold';
              } else if (status.isOvulation) {
                bgClasses = 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-300';
              } else if (status.isFertile) {
                bgClasses = 'bg-emerald-100 text-emerald-800 font-semibold';
              }

              if (!day.isCurrentMonth && !status.isPeriod && !status.isOvulation) {
                bgClasses = 'text-slate-300 bg-transparent';
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    onSelectDate(day.dateStr);
                    onOpenSymptomModal(day.dateStr);
                  }}
                  className={`relative h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 active:scale-90 ${bgClasses} ${
                    isSelected ? 'border-2 border-slate-900 font-bold shadow-xs' : ''
                  } ${isTodayDate && !status.isPeriod && !status.isOvulation && !isSelected ? 'border-2 border-rose-500 font-bold' : ''}`}
                >
                  <span className="text-xs">{day.dayNum}</span>

                  {/* Indicator dots & intimacy badge */}
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 h-2">
                    {hasIntimacy && (
                      <span className="text-[9px] leading-none animate-pulse">💖</span>
                    )}
                    {hasSymptoms && !hasIntimacy && (
                      <span className={`w-1 h-1 rounded-full ${status.isPeriod || status.isOvulation ? 'bg-white' : 'bg-rose-500'}`} />
                    )}
                    {status.isOvulation && !hasIntimacy && (
                      <span className="w-1 h-1 rounded-full bg-amber-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-rose-100/70 flex flex-wrap items-center justify-around gap-2 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Месячные</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>Овуляция</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
          <span>Фертильность</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">💖</span>
          <span>Половой акт</span>
        </div>
      </div>
    </div>
  );
};
