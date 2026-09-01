import React, { useState, useEffect } from 'react';
import type { TaskItem, TaskPriority, TaskCategoryItem, SubTask, DualColorTheme } from '../../types';
import { getTodayString, addDays } from '../../utils/dateUtils';
import { X, Check, Plus, Trash2, Calendar, Clock, ListPlus, Tag, AlertCircle, Bell, Settings } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: TaskItem | null;
  defaultDate?: string;
  theme?: DualColorTheme;
  categories?: TaskCategoryItem[];
  onOpenManageCategories?: () => void;
  onSave: (task: Partial<TaskItem>) => void;
  onDelete?: (taskId: string) => void;
  onClose: () => void;
}

const DEFAULT_CATEGORIES: TaskCategoryItem[] = [
  { id: 'personal', label: 'Личное' },
  { id: 'work', label: 'Работа' },
  { id: 'health', label: 'Здоровье' },
  { id: 'shopping', label: 'Покупки' },
  { id: 'study', label: 'Учеба' },
  { id: 'other', label: 'Другое' }
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  defaultDate,
  theme = { primary: '#203A5F', secondary: '#595959' },
  categories = DEFAULT_CATEGORIES,
  onOpenManageCategories,
  onSave,
  onDelete,
  onClose
}) => {
  const todayStr = getTodayString();
  const tomorrowStr = addDays(todayStr, 1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [time, setTime] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(0);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<string>('personal');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDate(taskToEdit.date || todayStr);
      setTime(taskToEdit.time || '');
      setReminderMinutesBefore(taskToEdit.reminderMinutesBefore ?? 0);
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'personal');
      setRepeat(taskToEdit.repeat || 'none');
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || todayStr);
      setTime('');
      setReminderMinutesBefore(0);
      setPriority('medium');
      setCategory(categories[0]?.id || 'personal');
      setRepeat('none');
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
    setHasError(false);
  }, [taskToEdit, defaultDate, isOpen, todayStr, categories]);

  if (!isOpen) return null;

  const priorities: { id: TaskPriority; label: string; dotColor: string; activeStyle: string; baseStyle: string }[] = [
    {
      id: 'high',
      label: 'Высокий',
      dotColor: 'bg-rose-500',
      activeStyle: 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200',
      baseStyle: 'border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100'
    },
    {
      id: 'medium',
      label: 'Средний',
      dotColor: 'bg-amber-500',
      activeStyle: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200',
      baseStyle: 'border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100'
    },
    {
      id: 'low',
      label: 'Низкий',
      dotColor: 'bg-slate-400',
      activeStyle: 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-200',
      baseStyle: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
    }
  ];

  const quickTimes = [
    { label: '09:00', value: '09:00' },
    { label: '13:00', value: '13:00' },
    { label: '18:00', value: '18:00' },
    { label: '21:00', value: '21:00' }
  ];

  const reminderOptions = [
    { label: 'В точное время', value: 0 },
    { label: 'За 5 мин', value: 5 },
    { label: 'За 10 мин', value: 10 },
    { label: 'За 15 мин', value: 15 },
    { label: 'За 30 мин', value: 30 },
    { label: 'За 1 час', value: 60 }
  ];

  const repeatOptions = [
    { id: 'none', label: 'Не повторять' },
    { id: 'daily', label: 'Каждый день' },
    { id: 'weekly', label: 'Каждую неделю' },
    { id: 'monthly', label: 'Каждый месяц' }
  ];

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      {
        id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: newSubtaskTitle.trim(),
        completed: false
      }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setHasError(true);
      return;
    }

    const cleanTime = time && time.trim() ? time.trim() : undefined;

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id, completed: taskToEdit.completed } : { completed: false }),
      title: cleanTitle,
      description: description.trim() || undefined,
      date: date || todayStr,
      time: cleanTime,
      reminderMinutesBefore: cleanTime ? reminderMinutesBefore : undefined,
      priority,
      category,
      repeat,
      subtasks: subtasks || [],
      createdAt: taskToEdit?.createdAt || new Date().toISOString()
    });

    onClose();
  };

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
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {taskToEdit ? 'Редактировать задачу' : 'Новая задача'}
            </h3>
            <p className="text-xs font-semibold" style={{ color: theme.primary }}>
              Планирование дня, недели и месяца
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto no-scrollbar px-1 py-3.5 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Название задачи *
              </label>
              {hasError && (
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Введите название
                </span>
              )}
            </div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder="Что нужно сделать?"
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors ${
                hasError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Описание / Заметки
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Дополнительные детали, ссылки, комментарии..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Date & Time Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            {/* Date Pick */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Дата выполнения</span>
                </label>
                <span className="text-[11px] font-bold text-[#203A5F]">
                  {date === todayStr ? 'Сегодня' : date === tomorrowStr ? 'Завтра' : date}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    date === todayStr
                      ? 'bg-[#203A5F] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Сегодня
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrowStr)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    date === tomorrowStr
                      ? 'bg-[#203A5F] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Завтра
                </button>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#203A5F]"
              />
            </div>

            {/* Time Pick */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Время выполнения</span>
                </label>
                {time && (
                  <button
                    type="button"
                    onClick={() => setTime('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Сбросить время ✕
                  </button>
                )}
              </div>

              {/* Quick Time Buttons */}
              <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
                {quickTimes.map(qt => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTime(qt.value)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      time === qt.value
                        ? 'bg-[#203A5F] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>

              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#203A5F]"
              />
            </div>

            {/* Reminder in advance selector (Only shown if time is set) */}
            {time && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 animate-fade-in">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#203A5F]" />
                  <span>Напомнить за:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {reminderOptions.map(opt => {
                    const isSelected = reminderMinutesBefore === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setReminderMinutesBefore(opt.value)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#203A5F] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Priority (clean dots, no emojis) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Приоритет задачи
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map(p => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected ? p.activeStyle : p.baseStyle
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : p.dotColor}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category with Manage button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Категория</span>
              </label>
              {onOpenManageCategories && (
                <button
                  type="button"
                  onClick={onOpenManageCategories}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Настроить</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map(c => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks (Checklist) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <ListPlus className="w-3.5 h-3.5 text-slate-400" />
              <span>Чек-лист / Подзадачи ({subtasks.length})</span>
            </label>

            {/* List of existing subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {idx + 1}. {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 active:scale-90 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Добавить пункт чек-листа..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+</span>
              </button>
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Повторение
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {repeatOptions.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRepeat(r.id as any)}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    repeat === r.id
                      ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
          {taskToEdit && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(taskToEdit.id);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-90 transition-transform cursor-pointer"
              title="Удалить задачу"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            form="task-form"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
            className="flex-1 py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{taskToEdit ? 'Сохранить изменения' : 'Создать задачу'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
