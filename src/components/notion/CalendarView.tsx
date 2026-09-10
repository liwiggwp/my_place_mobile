import React, { useState } from 'react';
import type { NotionDatabase, NotionItem } from '../../types/notion';
import { getTodayString, getMonthMatrix } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  database: NotionDatabase;
  onSelectItem: (item: NotionItem) => void;
  onAddItemOnDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  database,
  onSelectItem,
  onAddItemOnDate
}) => {
  const today = getTodayString();
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(today.substring(0, 7));
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const [year, month] = currentYearMonth.split('-').map(Number);
  const monthName = `${MONTH_NAMES[month - 1]} ${year}`;

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 2, 1);
    setCurrentYearMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month, 1);
    setCurrentYearMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Find date property ID
  const dateProp = database.properties.find(p => p.type === 'date');
  const datePropId = database.datePropertyId || dateProp?.id;

  // Group items by date string
  const itemsByDate: Record<string, NotionItem[]> = {};
  if (datePropId) {
    database.items.forEach(item => {
      const d = item.properties[datePropId];
      if (d && typeof d === 'string') {
        if (!itemsByDate[d]) itemsByDate[d] = [];
        itemsByDate[d].push(item);
      }
    });
  }

  const matrix = getMonthMatrix(year, month);
  const selectedDayItems = itemsByDate[selectedDate] || [];

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Month Navigation Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-slate-900 tracking-wide uppercase px-1">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentYearMonth(today.substring(0, 7));
            setSelectedDate(today);
          }}
          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          Сегодня
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
            <span
              key={day}
              className={`text-[11px] font-bold ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Matrix grid */}
        <div className="grid grid-cols-7 gap-1">
          {matrix.map((week, wIdx) =>
            week.map((dateObj, dIdx) => {
              const isToday = dateObj.dateStr === today;
              const isSelected = dateObj.dateStr === selectedDate;
              const isCurrentMonth = dateObj.isCurrentMonth;
              const dayItems = itemsByDate[dateObj.dateStr] || [];

              return (
                <div
                  key={`${wIdx}-${dIdx}`}
                  onClick={() => setSelectedDate(dateObj.dateStr)}
                  className={`min-h-[58px] p-1 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                      : isToday
                      ? 'bg-amber-50/60 border-amber-300'
                      : isCurrentMonth
                      ? 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/80'
                      : 'bg-white border-transparent opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-white font-black'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dateObj.dayNum}
                    </span>

                    {dayItems.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  {/* Mini pills in cell */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayItems.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        className="text-[9px] font-bold px-1 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 truncate shadow-2xs"
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-[8px] font-bold text-slate-400 pl-1">
                        +{dayItems.length - 2} еще
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              {selectedDate === today ? 'Сегодня, ' : ''}{selectedDate}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddItemOnDate(selectedDate)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить</span>
          </button>
        </div>

        {selectedDayItems.length === 0 ? (
          <div className="py-5 text-center text-slate-400 text-xs space-y-1">
            <p>На этот день записей нет</p>
            <button
              onClick={() => onAddItemOnDate(selectedDate)}
              className="text-indigo-600 font-bold hover:underline cursor-pointer text-xs"
            >
              + Создать запись на {selectedDate}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayItems.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <span className="text-xs font-bold text-slate-800 truncate">
                  {item.title}
                </span>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  Открыть →
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
