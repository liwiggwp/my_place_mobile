import React, { useState } from 'react';
import type { WaterLog, DualColorTheme } from '../../types';
import {
  getMonthMatrix,
  getTodayString,
  parseDateString,
  formatFullRussianDate
} from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  CheckCircle2,
  Trash2,
  Coffee,
  GlassWater,
  Flame,
  Calendar as CalendarIcon,
  TrendingUp,
  Award
} from 'lucide-react';

interface WaterCalendarProps {
  logs: WaterLog[];
  dailyGoal: number;
  theme?: DualColorTheme;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onDeleteLog?: (id: string) => void;
}

export const WaterCalendar: React.FC<WaterCalendarProps> = ({
  logs,
  dailyGoal,
  theme = { primary: '#203A5F', secondary: '#595959' },
  selectedDate,
  onSelectDate,
  onDeleteLog
}) => {
  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState(() => {
    const d = parseDateString(selectedDate || todayStr);
    return { year: d.getFullYear(), month: d.getMonth() };
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

  // Group logs by date
  const logsByDate = React.useMemo(() => {
    const map: Record<string, { total: number; logs: WaterLog[] }> = {};
    logs.forEach(l => {
      if (!map[l.date]) {
        map[l.date] = { total: 0, logs: [] };
      }
      map[l.date].total += l.amount;
      map[l.date].logs.push(l);
    });
    return map;
  }, [logs]);

  // Monthly stats
  const monthlyStats = React.useMemo(() => {
    let daysWithGoalMet = 0;
    let totalWaterInMonth = 0;
    let daysWithAnyWater = 0;

    matrix.forEach(week => {
      week.forEach(day => {
        if (day.isCurrentMonth) {
          const dayTotal = logsByDate[day.dateStr]?.total || 0;
          if (dayTotal >= dailyGoal) daysWithGoalMet++;
          if (dayTotal > 0) {
            daysWithAnyWater++;
            totalWaterInMonth += dayTotal;
          }
        }
      });
    });

    // Streak calculation (continuous days up to today meeting dailyGoal)
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const yr = checkDate.getFullYear();
      const mo = String(checkDate.getMonth() + 1).padStart(2, '0');
      const da = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${da}`;
      const total = logsByDate[dateStr]?.total || 0;
      if (total >= dailyGoal) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today hasn't met goal yet, check yesterday before stopping
        if (streak === 0 && dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if ((logsByDate[yesterdayStr]?.total || 0) >= dailyGoal) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    const avgDaily = daysWithAnyWater > 0 ? Math.round(totalWaterInMonth / daysWithAnyWater) : 0;

    return {
      daysWithGoalMet,
      streak,
      avgDaily
    };
  }, [matrix, logsByDate, dailyGoal, todayStr]);

  const selectedDayInfo = logsByDate[selectedDate] || { total: 0, logs: [] };
  const selectedDayPercent = Math.round((selectedDayInfo.total / dailyGoal) * 100);

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderDrinkIcon = (type: string) => {
    switch (type) {
      case 'tea':
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      default:
        return <GlassWater className="w-4 h-4" style={{ color: theme.primary }} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="rounded-3xl p-5 glass-card shadow-sm border border-slate-200/80">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <CalendarIcon className="w-4 h-4" style={{ color: theme.primary }} />
              <span>{monthNames[currentDate.month]} {currentDate.year}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Норма: {dailyGoal} мл/день
            </p>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
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

        {/* Calendar Day Matrix */}
        <div className="space-y-1">
          {matrix.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1">
              {week.map(day => {
                const dayData = logsByDate[day.dateStr];
                const dayTotal = dayData?.total || 0;
                const isGoalMet = dayTotal >= dailyGoal;
                const isPartial = dayTotal > 0 && !isGoalMet;
                const percent = Math.min(100, Math.round((dayTotal / dailyGoal) * 100));

                const isSelected = selectedDate === day.dateStr;
                const isTodayDate = todayStr === day.dateStr;

                let dayStyle = 'bg-transparent text-slate-700 hover:bg-slate-50';
                if (!day.isCurrentMonth) {
                  dayStyle += ' opacity-30';
                }

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => onSelectDate(day.dateStr)}
                    style={
                      isSelected
                        ? { borderColor: theme.primary, boxShadow: `0 0 0 2px ${theme.primary}` }
                        : isGoalMet
                        ? { backgroundColor: theme.primary, color: '#ffffff' }
                        : isPartial
                        ? { backgroundColor: `${theme.primary}18`, color: theme.primary }
                        : isTodayDate
                        ? { borderColor: `${theme.primary}80` }
                        : undefined
                    }
                    className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${dayStyle} ${
                      isSelected
                        ? 'font-black scale-105 z-10 shadow-md bg-white'
                        : isTodayDate
                        ? 'border-2'
                        : ''
                    }`}
                  >
                    <span className="text-xs leading-none">{day.dayNum}</span>

                    {/* Mini Indicator Badge */}
                    {isGoalMet && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-white mt-0.5" />
                    )}
                    {isPartial && (
                      <span className="text-[8px] leading-none font-extrabold mt-0.5" style={{ color: theme.primary }}>
                        {percent}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-md flex items-center justify-center text-white text-[8px]"
              style={{ backgroundColor: theme.primary }}
            >
              ✓
            </div>
            <span>Норма (100%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-md"
              style={{ backgroundColor: `${theme.primary}18`, border: `1px solid ${theme.primary}40` }}
            />
            <span>Частично</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md border border-slate-400" />
            <span>Сегодня</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center mb-1"
            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
          >
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{monthlyStats.daysWithGoalMet} дн.</div>
            <p className="text-[10px] font-medium text-slate-400">Норма за месяц</p>
          </div>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{monthlyStats.streak} дн.</div>
            <p className="text-[10px] font-medium text-slate-400">Стрик подряд</p>
          </div>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{monthlyStats.avgDaily} мл</div>
            <p className="text-[10px] font-medium text-slate-400">Среднее в день</p>
          </div>
        </div>
      </div>

      {/* Selected Day Details Card */}
      <div className="p-5 rounded-3xl glass-card shadow-sm border border-slate-200/80 space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
              {selectedDate === todayStr ? 'Сегодня • Записи' : 'История за выбранный день'}
            </span>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">
              {formatFullRussianDate(selectedDate)}
            </h4>
          </div>

          <div className="text-right">
            <div className="text-base font-black" style={{ color: theme.primary }}>
              {selectedDayInfo.total} <span className="text-xs font-semibold text-slate-400">/ {dailyGoal} мл</span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              {selectedDayPercent}% нормы
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, selectedDayPercent)}%`,
              background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
          />
        </div>

        {/* Logs for the selected date */}
        {selectedDayInfo.logs.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-xs">
            <Droplets className="w-6 h-6 mx-auto mb-1" style={{ color: theme.primary, opacity: 0.4 }} />
            <p className="font-medium text-slate-500">Записей за этот день нет</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pt-1">
            {selectedDayInfo.logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${theme.primary}12` }}
                  >
                    {renderDrinkIcon(log.type)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">+{log.amount} мл</span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {formatLogTime(log.timestamp)}
                    </span>
                  </div>
                </div>

                {onDeleteLog && (
                  <button
                    type="button"
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 active:scale-90 transition-all cursor-pointer"
                    title="Удалить запись"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
