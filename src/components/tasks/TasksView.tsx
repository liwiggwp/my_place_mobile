import React, { useState, useRef, useEffect } from 'react';
import type { TaskItem, TaskCategoryItem, TaskViewMode, DualColorTheme } from '../../types';
import {
  getTodayString,
  addDays,
  formatRussianDate,
  formatFullRussianDate,
  getMonthMatrix,
  parseDateString,
  formatDateToString
} from '../../utils/dateUtils';
import { TaskCard } from './TaskCard';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  tasks: TaskItem[];
  theme?: DualColorTheme;
  categories?: TaskCategoryItem[];
  notificationPermission?: NotificationPermission;
  onRequestPermission?: () => void;
  onTestNotification?: () => void;
  onOpenManageCategories?: () => void;
  onAddTask: (defaultDate?: string) => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
}

const DEFAULT_CATEGORIES: TaskCategoryItem[] = [
  { id: 'personal', label: 'Личное' },
  { id: 'work', label: 'Работа' },
  { id: 'health', label: 'Здоровье' },
  { id: 'shopping', label: 'Покупки' },
  { id: 'study', label: 'Учеба' },
  { id: 'other', label: 'Другое' }
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  theme = { primary: '#203A5F', secondary: '#595959' },
  categories = DEFAULT_CATEGORIES,
  notificationPermission,
  onRequestPermission,
  onTestNotification,
  onOpenManageCategories,
  onAddTask,
  onToggleTask,
  onToggleSubtask,
  onEditTask,
  onDeleteTask
}) => {
  const [viewMode, setViewMode] = useState<TaskViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Drag-to-scroll refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const isDraggingCarousel = useRef(false);
  const startXCarousel = useRef(0);
  const scrollLeftCarousel = useRef(0);
  const hasMovedCarousel = useRef(false);

  const isDraggingCat = useRef(false);
  const startXCat = useRef(0);
  const scrollLeftCat = useRef(0);
  const hasMovedCat = useRef(false);

  // Live Clock Ticker (ticks every 2 seconds to update overdue cards in real time)
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setCurrentTimeStr(prev => (prev !== timeStr ? timeStr : prev));
    };

    const timer = setInterval(updateTime, 2000);
    return () => clearInterval(timer);
  }, []);

  // For Month View
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = parseDateString(getTodayString());
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const todayStr = getTodayString();

  const filterCategories: { id: string; label: string }[] = [
    { id: 'all', label: 'Все' },
    ...categories
  ];

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Filter tasks for the selected date (Day Mode) and sort by time
  const dayTasks = tasks
    .filter(t => t.date === selectedDate)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return 0;
    });

  const filteredDayTasks = dayTasks.filter(t =>
    selectedCategory === 'all' ? true : t.category === selectedCategory
  );

  const activeDayTasks = filteredDayTasks.filter(t => !t.completed);
  const completedDayTasks = filteredDayTasks.filter(t => t.completed);

  // Day Progress Calculation
  const totalDayTasksCount = dayTasks.length;
  const completedDayTasksCount = dayTasks.filter(t => t.completed).length;
  const dayProgressPercent =
    totalDayTasksCount > 0 ? Math.round((completedDayTasksCount / totalDayTasksCount) * 100) : 0;

  // Day Carousel Generator (-14 days to +45 days)
  const dayCarousel: { dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
  const startOffset = -14;
  const endOffset = 45;
  const russianShortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  for (let i = startOffset; i <= endOffset; i++) {
    const dStr = addDays(todayStr, i);
    const d = parseDateString(dStr);
    dayCarousel.push({
      dateStr: dStr,
      dayNum: d.getDate(),
      dayName: russianShortDays[d.getDay()],
      isToday: dStr === todayStr
    });
  }

  // Scroll to selected date button on load
  useEffect(() => {
    if (carouselRef.current) {
      const selectedEl = carouselRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate, viewMode]);

  /* ==========================================
     DRAG-TO-SCROLL MOUSE & TOUCH HANDLERS
     ========================================== */

  const handleCarouselMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDraggingCarousel.current = true;
    hasMovedCarousel.current = false;
    startXCarousel.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftCarousel.current = carouselRef.current.scrollLeft;
  };

  const handleCarouselMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCarousel.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXCarousel.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedCarousel.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftCarousel.current - walk;
  };

  const handleCarouselMouseUpOrLeave = () => {
    isDraggingCarousel.current = false;
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!categoriesRef.current) return;
    isDraggingCat.current = true;
    hasMovedCat.current = false;
    startXCat.current = e.pageX - categoriesRef.current.offsetLeft;
    scrollLeftCat.current = categoriesRef.current.scrollLeft;
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCat.current || !categoriesRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriesRef.current.offsetLeft;
    const walk = (x - startXCat.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedCat.current = true;
    }
    categoriesRef.current.scrollLeft = scrollLeftCat.current - walk;
  };

  const handleCatMouseUpOrLeave = () => {
    isDraggingCat.current = false;
  };

  const handleWheelHorizontal = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  // Week View: Get 7 days for current week of selectedDate
  const getWeekDates = (baseDateStr: string) => {
    const base = parseDateString(baseDateStr);
    let dayOfWeek = base.getDay() - 1; // 0 for Mon
    if (dayOfWeek === -1) dayOfWeek = 6; // Sunday

    const monDate = new Date(base);
    monDate.setDate(base.getDate() - dayOfWeek);

    const week: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monDate);
      d.setDate(monDate.getDate() + i);
      const dStr = formatDateToString(d);
      week.push({
        dateStr: dStr,
        dayName: weekDayNames[i],
        dayNum: d.getDate(),
        isToday: dStr === todayStr
      });
    }
    return week;
  };

  const currentWeekDates = getWeekDates(selectedDate);

  // Month View Matrix
  const monthMatrix = getMonthMatrix(monthCursor.year, monthCursor.month);

  const prevMonth = () => {
    setMonthCursor(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setMonthCursor(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleToggleWithFeedback = (taskId: string) => {
    onToggleTask(taskId);
    const target = tasks.find(t => t.id === taskId);
    if (target && !target.completed) {
      if (navigator.vibrate) navigator.vibrate(20);
      if (activeDayTasks.length === 1 && activeDayTasks[0].id === taskId) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in select-none">
      {/* Notification Banner & Quick Test */}
      {notificationPermission !== 'granted' && onRequestPermission ? (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900 font-semibold truncate">
              Включите уведомления для задач и напоминаний
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestPermission}
            style={{ backgroundColor: theme.primary }}
            className="px-3 py-1 rounded-xl text-white font-bold text-xs shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            Разрешить
          </button>
        </div>
      ) : onTestNotification ? (
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            <span>Напоминания активны</span>
          </span>
          <button
            type="button"
            onClick={onTestNotification}
            className="text-xs font-bold text-slate-700 underline cursor-pointer hover:text-slate-900"
          >
            Проверить звук и сигнал
          </button>
        </div>
      ) : null}

      {/* 1. TOP SEGMENTED SWITCHER: ДЕНЬ / НЕДЕЛЯ / МЕСЯЦ */}
      <div className="p-1 rounded-2xl bg-slate-100 flex items-center shadow-2xs">
        <button
          type="button"
          onClick={() => setViewMode('day')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'day'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-[#595959] hover:text-slate-900'
          }`}
        >
          День
        </button>
        <button
          type="button"
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'week'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-[#595959] hover:text-slate-900'
          }`}
        >
          Неделя
        </button>
        <button
          type="button"
          onClick={() => setViewMode('month')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'month'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-[#595959] hover:text-slate-900'
          }`}
        >
          Месяц
        </button>
      </div>

      {/* =======================================================
          VIEW MODE 1: DAY (ДЕНЬ)
          ======================================================= */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Carousel with Gesture / Mouse Drag-to-Scroll */}
          <div
            ref={carouselRef}
            onMouseDown={handleCarouselMouseDown}
            onMouseMove={handleCarouselMouseMove}
            onMouseUp={handleCarouselMouseUpOrLeave}
            onMouseLeave={handleCarouselMouseUpOrLeave}
            onWheel={handleWheelHorizontal}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing"
          >
            {dayCarousel.map(item => {
              const isSelected = selectedDate === item.dateStr;
              const hasTasksOnDay = tasks.some(t => t.date === item.dateStr && !t.completed);

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    if (!hasMovedCarousel.current) {
                      setSelectedDate(item.dateStr);
                    }
                  }}
                  style={
                    isSelected
                      ? {
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                        }
                      : undefined
                  }
                  className={`w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 relative ${
                    isSelected
                      ? 'text-white shadow-md shadow-slate-300'
                      : item.isToday
                      ? 'bg-slate-100 text-slate-800 border-2 border-slate-300'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.dayName}
                  </span>
                  <span className="text-base font-black leading-tight mt-0.5">
                    {item.dayNum}
                  </span>

                  {/* Task indicator dot */}
                  {hasTasksOnDay && !isSelected && (
                    <span
                      style={{ backgroundColor: theme.primary }}
                      className="w-1.5 h-1.5 rounded-full absolute bottom-1.5"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Progress Banner */}
          <div
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
            className="p-5 rounded-3xl text-white shadow-md shadow-slate-200/50 flex items-center justify-between relative overflow-hidden"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                  {selectedDate === todayStr ? 'План на сегодня' : formatFullRussianDate(selectedDate)}
                </span>
                {selectedDate !== todayStr && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="text-[10px] font-bold text-white underline cursor-pointer hover:opacity-80"
                  >
                    Перейти на сегодня
                  </button>
                )}
              </div>
              <h3 className="text-xl font-black tracking-tight mt-1.5 truncate">
                {totalDayTasksCount === 0
                  ? 'Нет запланированных задач'
                  : completedDayTasksCount === totalDayTasksCount
                  ? 'Все задачи выполнены'
                  : `Выполнено ${completedDayTasksCount} из ${totalDayTasksCount}`}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {totalDayTasksCount === 0
                  ? 'Нажмите «+ Новая задача», чтобы добавить'
                  : `${dayProgressPercent}% дневного плана завершено`}
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-black">{dayProgressPercent}%</span>
            </div>
          </div>

          {/* Category Filter Pills (with gesture/mouse drag-to-scroll & manage button) */}
          <div
            ref={categoriesRef}
            onMouseDown={handleCatMouseDown}
            onMouseMove={handleCatMouseMove}
            onMouseUp={handleCatMouseUpOrLeave}
            onMouseLeave={handleCatMouseUpOrLeave}
            onWheel={handleWheelHorizontal}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing"
          >
            {filterCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (!hasMovedCat.current) {
                      setSelectedCategory(cat.id);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* Manage Categories Action Button */}
            {onOpenManageCategories && (
              <button
                type="button"
                onClick={onOpenManageCategories}
                className="px-2.5 py-1.5 rounded-full border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
                title="Настроить категории"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Настроить</span>
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {/* Active Tasks */}
            {activeDayTasks.length > 0 ? (
              activeDayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentTimeStr={currentTimeStr}
                  theme={theme}
                  categories={categories}
                  onToggleTask={handleToggleWithFeedback}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            ) : totalDayTasksCount === 0 ? (
              <div className="p-8 rounded-3xl glass-card text-center text-slate-400 space-y-2 border border-slate-200">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">На этот день задач нет</h4>
                <p className="text-xs text-[#595959]">
                  Запланируйте дела, тренировки, встречи или покупки
                </p>
                <button
                  type="button"
                  onClick={() => onAddTask(selectedDate)}
                  style={{ backgroundColor: theme.primary }}
                  className="mt-2 px-4 py-2 rounded-2xl text-white font-bold text-xs shadow-md shadow-slate-300 active:scale-95 cursor-pointer"
                >
                  + Создать первую задачу
                </button>
              </div>
            ) : null}

            {/* Completed Tasks Accordion */}
            {completedDayTasks.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center justify-between w-full px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
                >
                  <span>Завершённые ({completedDayTasks.length})</span>
                  <span>{showCompleted ? 'Скрыть' : 'Показать'}</span>
                </button>

                {showCompleted && (
                  <div className="space-y-2.5 mt-2">
                    {completedDayTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentTimeStr={currentTimeStr}
                        theme={theme}
                        categories={categories}
                        onToggleTask={handleToggleWithFeedback}
                        onToggleSubtask={onToggleSubtask}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          VIEW MODE 2: WEEK (НЕДЕЛЯ)
          ======================================================= */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Week Navigation Header */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div className="text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Текущая неделя</h4>
              <p className="text-sm font-black text-slate-800">
                {formatRussianDate(currentWeekDates[0].dateStr)} — {formatRussianDate(currentWeekDates[6].dateStr, true)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* 7 Days Strip */}
          <div className="grid grid-cols-7 gap-1">
            {currentWeekDates.map(day => {
              const dayTasksList = tasks.filter(t => t.date === day.dateStr);
              const doneCount = dayTasksList.filter(t => t.completed).length;
              const isSelected = selectedDate === day.dateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-xs'
                      : day.isToday
                      ? 'bg-slate-100 border border-slate-300 text-slate-800'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-bold">{day.dayName}</span>
                  <span className="text-sm font-black mt-0.5">{day.dayNum}</span>
                  <span className="text-[9px] font-semibold mt-1">
                    {dayTasksList.length > 0 ? `${doneCount}/${dayTasksList.length}` : '—'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grouped Week Breakdown */}
          <div className="space-y-4 pt-1">
            {currentWeekDates.map(day => {
              const dayTasksList = tasks
                .filter(t => t.date === day.dateStr)
                .sort((a, b) => {
                  if (a.time && b.time) return a.time.localeCompare(b.time);
                  if (a.time && !b.time) return -1;
                  if (!a.time && b.time) return 1;
                  return 0;
                });

              return (
                <div key={day.dateStr} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={day.isToday ? 'text-rose-500 font-black' : ''}>
                        {day.dayName}, {formatRussianDate(day.dateStr)}
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full">
                          Сегодня
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddTask(day.dateStr)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      + Добавить
                    </button>
                  </div>

                  {dayTasksList.length > 0 ? (
                    <div className="space-y-2">
                      {dayTasksList.map(t => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          currentTimeStr={currentTimeStr}
                          theme={theme}
                          categories={categories}
                          onToggleTask={handleToggleWithFeedback}
                          onToggleSubtask={onToggleSubtask}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/60 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Нет задач
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================
          VIEW MODE 3: MONTH (МЕСЯЦ)
          ======================================================= */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          {/* Month Calendar Selector */}
          <div className="p-5 rounded-3xl glass-card border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              <h3 className="text-base font-bold text-slate-800">
                {monthNames[monthCursor.month]} {monthCursor.year}
              </h3>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
              {weekDayNames.map((d, i) => (
                <span key={d} className={i >= 5 ? 'text-rose-400' : ''}>
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid with Task Indicator Dots */}
            <div className="space-y-1">
              {monthMatrix.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 gap-1">
                  {week.map(day => {
                    const isSelected = selectedDate === day.dateStr;
                    const isTodayDate = day.dateStr === todayStr;
                    const dayTasksList = tasks.filter(t => t.date === day.dateStr);
                    const pendingTasksCount = dayTasksList.filter(t => !t.completed).length;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`h-11 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-2 border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                            : isTodayDate
                            ? 'bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold'
                            : day.isCurrentMonth
                            ? 'bg-transparent text-slate-700 hover:bg-slate-100'
                            : 'bg-transparent text-slate-300'
                        }`}
                      >
                        <span className="text-xs leading-none">{day.dayNum}</span>

                        {/* Task Count Dots */}
                        {dayTasksList.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {pendingTasksCount > 0 ? (
                              <span
                                style={{ backgroundColor: isSelected ? '#ffffff' : theme.primary }}
                                className="w-1.5 h-1.5 rounded-full"
                              />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks of Selected Day in Month */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Задачи на {formatRussianDate(selectedDate, true)}
              </h4>
              <button
                type="button"
                onClick={() => onAddTask(selectedDate)}
                style={{ color: theme.primary }}
                className="text-xs font-bold cursor-pointer hover:underline"
              >
                + Добавить
              </button>
            </div>

            {dayTasks.length > 0 ? (
              dayTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  currentTimeStr={currentTimeStr}
                  theme={theme}
                  categories={categories}
                  onToggleTask={handleToggleWithFeedback}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            ) : (
              <div className="p-6 rounded-3xl glass-card text-center text-slate-400 text-xs border border-slate-200">
                На эту дату задач пока нет
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating "+ Новая задача" Action Button */}
      <div className="fixed bottom-20 left-0 right-0 z-30 pointer-events-none px-6">
        <div className="max-w-md mx-auto flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={() => onAddTask(selectedDate)}
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
            className="py-3.5 px-5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-slate-300 active:scale-95 transition-transform cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Новая задача</span>
          </button>
        </div>
      </div>
    </div>
  );
};
