import React, { useState, useRef } from 'react';
import type { Pill, PillLog, PillStatus, DualColorTheme } from '../../types';
import {
  getMonthMatrix,
  getTodayString,
  parseDateString,
  diffInDays,
  formatRussianDate,
  formatFullRussianDate
} from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Pill as PillIcon,
  Sparkles,
  Flag,
  Sun,
  Heart,
  Leaf,
  Play,
  Square
} from 'lucide-react';

interface PillsCalendarProps {
  pills: Pill[];
  logs: PillLog[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onLogStatus: (pillId: string, scheduledTime: string, status: PillStatus) => void;
  theme?: DualColorTheme;
}

export const PillsCalendar: React.FC<PillsCalendarProps> = ({
  pills,
  logs,
  selectedDate,
  onSelectDate,
  onLogStatus,
  theme = { primary: '#203A5F', secondary: '#595959' }
}) => {
  const todayStr = getTodayString();
  const [calendarMode, setCalendarMode] = useState<'courses' | 'history'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Smooth drag-to-scroll for the Course Chips row
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const handleChipsMouseDown = (e: React.MouseEvent) => {
    if (!chipsScrollRef.current) return;
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.pageX - chipsScrollRef.current.offsetLeft;
    scrollLeft.current = chipsScrollRef.current.scrollLeft;
  };

  const handleChipsMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !chipsScrollRef.current) return;
    const x = e.pageX - chipsScrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 4) {
      dragMoved.current = true;
    }
    chipsScrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleChipsMouseUp = () => {
    isDragging.current = false;
  };

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

  // Active courses list
  const activeCourses = pills.filter(p => p.active && p.isCourse && p.courseEndDate);
  const selectedCourse = activeCourses.find(c => c.id === selectedCourseId);

  // Course options list for horizontal chips row
  const courseOptions: { id: string; name: string; color?: string }[] = [
    { id: 'all', name: 'Все курсы', color: theme.primary },
    ...activeCourses.map(c => ({ id: c.id, name: c.name, color: c.color }))
  ];

  // Helper to determine if a pill is scheduled on a given date
  const isPillScheduledOnDate = (pill: Pill, dateStr: string) => {
    if (!pill.active) return false;
    if (pill.isCourse) {
      if (pill.courseStartDate && dateStr < pill.courseStartDate) return false;
      if (pill.courseEndDate && dateStr > pill.courseEndDate) return false;
    }
    return true;
  };

  // Calculate day details
  const getDayInfo = (dateStr: string) => {
    const scheduled = pills.filter(p => isPillScheduledOnDate(p, dateStr));
    let totalDoses = 0;
    let takenDoses = 0;

    scheduled.forEach(pill => {
      pill.times.forEach(time => {
        totalDoses++;
        const isTaken = logs.some(
          l => l.pillId === pill.id && l.date === dateStr && l.scheduledTime === time && l.status === 'taken'
        );
        if (isTaken) takenDoses++;
      });
    });

    const dayActiveCourses = activeCourses.filter(
      c => (!c.courseStartDate || dateStr >= c.courseStartDate) && (!c.courseEndDate || dateStr <= c.courseEndDate)
    );

    const coursesStartingToday = activeCourses.filter(c => c.courseStartDate === dateStr);
    const coursesEndingToday = activeCourses.filter(c => c.courseEndDate === dateStr);

    return {
      scheduled,
      totalDoses,
      takenDoses,
      isAllTaken: totalDoses > 0 && takenDoses === totalDoses,
      isPartial: takenDoses > 0 && takenDoses < totalDoses,
      dayActiveCourses,
      coursesStartingToday,
      coursesEndingToday
    };
  };

  const selectedDayInfo = getDayInfo(selectedDate);

  const getPillCategoryIcon = (category: string) => {
    switch (category) {
      case 'vitamin':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'contraceptive':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'supplement':
        return <Leaf className="w-4 h-4 text-emerald-500" />;
      default:
        return <PillIcon className="w-4 h-4" style={{ color: theme.primary }} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Switch Tabs (Курсы препаратов / История приёма) */}
      <div className="p-1.5 rounded-2xl bg-slate-100/90 flex items-center gap-1 border border-slate-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => setCalendarMode('courses')}
          style={calendarMode === 'courses' ? { color: theme.primary } : undefined}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            calendarMode === 'courses'
              ? 'bg-white shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Курсы препаратов</span>
          {activeCourses.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
            >
              {activeCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCalendarMode('history')}
          style={calendarMode === 'history' ? { color: theme.primary } : undefined}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
            calendarMode === 'history'
              ? 'bg-white shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>История приёма</span>
        </button>
      </div>

      {/* Main Calendar Card */}
      <div className="rounded-3xl p-5 glass-card shadow-sm border border-slate-200/80 select-none relative overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <span>{monthNames[currentDate.month]} {currentDate.year}</span>
            </h3>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.primary }}>
              {calendarMode === 'courses'
                ? selectedCourse
                  ? `Курс: ${selectedCourse.name} (до ${formatRussianDate(selectedCourse.courseEndDate!)})`
                  : 'Таймлайн всех активных курсов'
                : 'Отметки выпитых доз по дням'}
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

        {/* Scrollable / Draggable Course Filter Chips Row */}
        {calendarMode === 'courses' && activeCourses.length > 0 && (
          <div className="mb-3">
            <div
              ref={chipsScrollRef}
              onMouseDown={handleChipsMouseDown}
              onMouseMove={handleChipsMouseMove}
              onMouseUp={handleChipsMouseUp}
              onMouseLeave={handleChipsMouseUp}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-0.5 cursor-grab active:cursor-grabbing select-none touch-pan-x"
            >
              {courseOptions.map(c => {
                const isSelected = selectedCourseId === c.id;
                const daysLeft =
                  c.id !== 'all'
                    ? diffInDays(activeCourses.find(item => item.id === c.id)?.courseEndDate!, todayStr)
                    : null;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (dragMoved.current) return;
                      setSelectedCourseId(c.id);
                      try { navigator.vibrate?.(15); } catch {}
                    }}
                    style={
                      isSelected
                        ? { backgroundColor: theme.primary, color: '#ffffff' }
                        : { borderColor: `${theme.primary}30` }
                    }
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'shadow-xs scale-102'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || theme.primary }}
                    />
                    <span>{c.name}</span>
                    {daysLeft !== null && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {daysLeft >= 0 ? `${daysLeft} дн.` : 'завершен'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Calendar Matrix */}
        <div className="space-y-1">
          {matrix.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1">
              {week.map(day => {
                const info = getDayInfo(day.dateStr);
                const isSelected = selectedDate === day.dateStr;
                const isTodayDate = todayStr === day.dateStr;

                // Mode 1: COURSES VIEW
                if (calendarMode === 'courses') {
                  const isFocusCourse = Boolean(selectedCourse);
                  const isDayInFocusCourse =
                    selectedCourse &&
                    (!selectedCourse.courseStartDate || day.dateStr >= selectedCourse.courseStartDate) &&
                    (!selectedCourse.courseEndDate || day.dateStr <= selectedCourse.courseEndDate);

                  const isStartOfFocus = selectedCourse && day.dateStr === selectedCourse.courseStartDate;
                  const isEndOfFocus = selectedCourse && day.dateStr === selectedCourse.courseEndDate;
                  const hasAnyCourse = info.dayActiveCourses.length > 0;

                  let cellStyle = 'bg-transparent text-slate-700 hover:bg-slate-50';

                  if (isFocusCourse) {
                    if (isDayInFocusCourse) {
                      cellStyle = 'bg-slate-100/90 text-slate-900 font-bold border-y border-slate-200';
                    } else {
                      cellStyle = 'opacity-30 text-slate-400';
                    }
                  } else {
                    if (hasAnyCourse) {
                      cellStyle = 'bg-slate-50 text-slate-800 font-semibold';
                    }
                  }

                  if (!day.isCurrentMonth) {
                    cellStyle += ' opacity-25';
                  }

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => onSelectDate(day.dateStr)}
                      style={
                        isSelected
                          ? { borderColor: theme.primary, boxShadow: `0 0 0 2px ${theme.primary}` }
                          : isTodayDate
                          ? { borderColor: `${theme.primary}80` }
                          : undefined
                      }
                      className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${cellStyle} ${
                        isSelected
                          ? 'font-black scale-105 z-10 shadow-md bg-white'
                          : isTodayDate
                          ? 'border-2'
                          : ''
                      }`}
                    >
                      <span className="text-xs leading-none">{day.dayNum}</span>

                      {/* Course specific badges with Pill color circles: Triangle for start, Square for finish/end */}
                      <div className="flex items-center justify-center gap-0.5 mt-1 min-h-[14px]">
                        {isFocusCourse ? (
                          isStartOfFocus ? (
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs"
                              style={{ backgroundColor: selectedCourse.color || theme.primary }}
                              title={`Начало курса: ${selectedCourse.name}`}
                            >
                              <Play className="w-1.5 h-1.5 fill-white text-white translate-x-[0.5px]" />
                            </div>
                          ) : isEndOfFocus ? (
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs"
                              style={{ backgroundColor: selectedCourse.color || theme.primary }}
                              title={`Конец курса: ${selectedCourse.name}`}
                            >
                              <Square className="w-1.5 h-1.5 fill-white text-white" />
                            </div>
                          ) : isDayInFocusCourse ? (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: selectedCourse.color || theme.primary }}
                            />
                          ) : null
                        ) : (
                          <>
                            {/* In All Courses: show circles for starts, ends, and dots for ongoing */}
                            {info.coursesStartingToday.map(c => (
                              <div
                                key={`start-${c.id}`}
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs"
                                style={{ backgroundColor: c.color || theme.primary }}
                                title={`Начало курса: ${c.name}`}
                              >
                                <Play className="w-1.5 h-1.5 fill-white text-white translate-x-[0.5px]" />
                              </div>
                            ))}
                            {info.coursesEndingToday.map(c => (
                              <div
                                key={`end-${c.id}`}
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs"
                                style={{ backgroundColor: c.color || theme.primary }}
                                title={`Конец курса: ${c.name}`}
                              >
                                <Square className="w-1.5 h-1.5 fill-white text-white" />
                              </div>
                            ))}
                            {info.coursesStartingToday.length === 0 &&
                              info.coursesEndingToday.length === 0 &&
                              info.dayActiveCourses.slice(0, 3).map(c => (
                                <div
                                  key={`dot-${c.id}`}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: c.color || theme.primary }}
                                  title={`Курс: ${c.name}`}
                                />
                              ))}
                          </>
                        )}
                      </div>
                    </button>
                  );
                }

                // Mode 2: INTAKE HISTORY VIEW
                let historyStyle = 'bg-transparent text-slate-700 hover:bg-slate-50';
                if (info.isAllTaken) {
                  historyStyle = 'text-white font-black shadow-xs';
                } else if (info.isPartial) {
                  historyStyle = 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200';
                }

                if (!day.isCurrentMonth) {
                  historyStyle += ' opacity-25';
                }

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => onSelectDate(day.dateStr)}
                    style={
                      isSelected
                        ? { borderColor: theme.primary, boxShadow: `0 0 0 2px ${theme.primary}` }
                        : isTodayDate
                        ? { borderColor: `${theme.primary}80` }
                        : info.isAllTaken
                        ? { backgroundColor: theme.primary }
                        : undefined
                    }
                    className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${historyStyle} ${
                      isSelected
                        ? 'font-black scale-105 z-10 shadow-md'
                        : isTodayDate
                        ? 'border-2'
                        : ''
                    }`}
                  >
                    <span className="text-xs leading-none">{day.dayNum}</span>

                    {info.isAllTaken ? (
                      <Check className="w-3 h-3 text-white mt-0.5 stroke-[3]" />
                    ) : info.isPartial ? (
                      <span className="text-[8px] leading-none font-black text-amber-800 mt-0.5">
                        {info.takenDoses}/{info.totalDoses}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-500 flex-wrap">
          {calendarMode === 'courses' ? (
            <>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Play className="w-1.5 h-1.5 fill-white text-white translate-x-[0.5px]" />
                </div>
                <span>Начало курса</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Square className="w-1.5 h-1.5 fill-white text-white" />
                </div>
                <span>Конец курса</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span>Дни курса</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-md flex items-center justify-center text-white text-[8px]"
                  style={{ backgroundColor: theme.primary }}
                >
                  ✓
                </div>
                <span>Все принято</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                <span>Частично</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md border border-slate-400" />
                <span>Сегодня</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Courses Summary Cards (When in courses mode) */}
      {calendarMode === 'courses' && activeCourses.length > 0 && (
        <div className="p-4 rounded-3xl glass-card shadow-sm border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.primary }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Длительность и окончание курсов ({activeCourses.length})</span>
          </h4>

          <div className="space-y-2.5">
            {activeCourses.map(course => {
              const start = course.courseStartDate || course.createdAt.split('T')[0];
              const end = course.courseEndDate!;
              const totalDays = course.courseDurationDays || (diffInDays(end, start) + 1);
              const daysLeft = diffInDays(end, todayStr);
              const daysPassed = Math.max(0, totalDays - Math.max(0, daysLeft));
              const progress = Math.min(100, Math.round((daysPassed / totalDays) * 100));

              const isFinished = daysLeft < 0;
              const isLastDay = daysLeft === 0;

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  style={
                    selectedCourseId === course.id
                      ? { borderColor: theme.primary, boxShadow: `0 0 0 1px ${theme.primary}` }
                      : undefined
                  }
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
                    selectedCourseId === course.id
                      ? 'shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${course.color}20` }}
                      >
                        {getPillCategoryIcon(course.category)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{course.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">({course.dosage})</span>
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Курс на {totalDays} дн. • {course.times.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isFinished ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Завершен
                        </span>
                      ) : isLastDay ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-pulse border border-rose-300">
                          Конец курса сегодня!
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
                        >
                          Осталось {daysLeft} дн.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: course.color || theme.primary
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1.5">
                      <span>День {daysPassed} из {totalDays}</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <Flag className="w-3 h-3 text-slate-500" />
                        Пить до: {formatRussianDate(end, true)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Details & Pill Checkboxes */}
      <div className="p-5 rounded-3xl glass-card shadow-sm border border-slate-200/80 space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
              {selectedDate === todayStr ? 'Сегодня • Расписание' : 'Расписание на выбранный день'}
            </span>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">
              {formatFullRussianDate(selectedDate)}
            </h4>
          </div>

          <div className="text-right">
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
            >
              {selectedDayInfo.takenDoses} из {selectedDayInfo.totalDoses} доз
            </span>
          </div>
        </div>

        {/* Highlight if courses finish/end on this selected date */}
        {selectedDayInfo.coursesEndingToday.length > 0 && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2.5">
            <Flag className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <div className="text-xs font-black text-rose-800">Последний день приема (пить до сегодня включительно):</div>
              <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                {selectedDayInfo.coursesEndingToday.map(c => `${c.name} (${c.dosage})`).join(' • ')}
              </div>
            </div>
          </div>
        )}

        {/* List of pills scheduled for the selected day */}
        {selectedDayInfo.scheduled.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-xs">
            <PillIcon className="w-6 h-6 mx-auto mb-1" style={{ color: theme.primary, opacity: 0.4 }} />
            <p className="font-medium text-slate-500">На этот день нет запланированных препаратов</p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {selectedDayInfo.scheduled.map(pill => {
              const isEndingToday = pill.isCourse && pill.courseEndDate === selectedDate;
              return (
                <div
                  key={pill.id}
                  className={`p-3 rounded-2xl bg-white border shadow-2xs space-y-2 ${
                    isEndingToday ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${pill.color}20` }}
                      >
                        {getPillCategoryIcon(pill.category)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{pill.name}</h5>
                        <span className="text-[10px] text-slate-400">{pill.dosage}</span>
                      </div>
                    </div>

                    {isEndingToday ? (
                      <span className="text-[9px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5 text-rose-600" />
                        Конец курса
                      </span>
                    ) : pill.isCourse && pill.courseEndDate ? (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: `${theme.primary}12`, color: theme.primary }}
                      >
                        <Flag className="w-2.5 h-2.5" />
                        до {formatRussianDate(pill.courseEndDate)}
                      </span>
                    ) : null}
                  </div>

                  {/* Times with check buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {pill.times.map(time => {
                      const log = logs.find(
                        l => l.pillId === pill.id && l.date === selectedDate && l.scheduledTime === time
                      );
                      const isTaken = log?.status === 'taken';

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => onLogStatus(pill.id, time, isTaken ? 'skipped' : 'taken')}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all active:scale-95 cursor-pointer ${
                            isTaken
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isTaken ? 'text-white' : 'text-slate-400'}`} />
                            <span>{time}</span>
                          </div>
                          {isTaken ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-black">
                              <Check className="w-3 h-3 stroke-[3]" /> Выпито
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold" style={{ color: theme.primary }}>
                              + Выпить
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
