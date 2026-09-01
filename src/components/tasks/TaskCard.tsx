import React, { useState } from 'react';
import type { TaskItem, TaskCategoryItem, DualColorTheme } from '../../types';
import { getTodayString } from '../../utils/dateUtils';
import { Check, Clock, ChevronDown, ChevronUp, Edit3, Trash2, ListChecks, Bell } from 'lucide-react';

interface TaskCardProps {
  task: TaskItem;
  theme?: DualColorTheme;
  categories?: TaskCategoryItem[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  theme = { primary: '#203A5F', secondary: '#595959' },
  categories = [],
  onToggleTask,
  onToggleSubtask,
  onEdit,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayStr = getTodayString();
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // Overdue Check: not completed AND (date in past OR (today and time in past))
  const isOverdue = !task.completed && (
    task.date < todayStr ||
    (task.date === todayStr && !!task.time && task.time < currentTimeStr)
  );

  // Priority Visual Configuration (Clean badges with colored dots, no emojis)
  const priorityConfig = {
    high: {
      label: 'Высокий',
      dotColor: 'bg-rose-500',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    medium: {
      label: 'Средний',
      dotColor: 'bg-amber-500',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    low: {
      label: 'Низкий',
      dotColor: 'bg-slate-400',
      badgeColor: 'text-slate-600 bg-slate-100 border-slate-200'
    }
  }[task.priority || 'medium'];

  // Resolve Category
  const matchedCategory = categories.find(c => c.id === task.category);
  const defaultCategoryMap: Record<string, { label: string; color: string }> = {
    personal: { label: 'Личное', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    work: { label: 'Работа', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    health: { label: 'Здоровье', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    shopping: { label: 'Покупки', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    study: { label: 'Учеба', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    other: { label: 'Другое', color: 'bg-slate-50 text-slate-700 border-slate-200' }
  };

  const categoryLabel = matchedCategory?.label || defaultCategoryMap[task.category]?.label || task.category || 'Другое';
  const categoryColor = matchedCategory?.color || defaultCategoryMap[task.category]?.color || 'bg-slate-50 text-slate-700 border-slate-200';

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter(s => s.completed).length;

  return (
    <div
      className={`p-4 rounded-3xl transition-all duration-200 ${
        isOverdue
          ? 'bg-rose-50/90 border border-rose-300 shadow-sm shadow-rose-100'
          : task.completed
          ? 'bg-white/60 border border-slate-200/70 opacity-75'
          : 'bg-white/95 border border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          style={task.completed ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
          className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 mt-0.5 ${
            task.completed
              ? 'text-white shadow-xs'
              : isOverdue
              ? 'border-rose-400 bg-white hover:border-rose-600'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
          aria-label={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {/* Category Tag */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
              isOverdue ? 'bg-white/80 border-rose-200 text-rose-800' : categoryColor
            }`}>
              <span>{categoryLabel}</span>
            </span>

            {/* Clear Priority Badge */}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${
              isOverdue ? 'bg-white/80 border-rose-200 text-rose-800' : priorityConfig.badgeColor
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`} />
              <span>{priorityConfig.label}</span>
            </span>

            {/* Scheduled Time (Highlighted in Red if Overdue) */}
            {task.time && (
              <span className={`text-[10px] font-bold flex items-center gap-1 ml-auto ${
                isOverdue ? 'text-rose-600' : 'text-slate-500'
              }`}>
                <Clock className={`w-3 h-3 ${isOverdue ? 'text-rose-500 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{task.time}</span>
                {task.reminderMinutesBefore && task.reminderMinutesBefore > 0 ? (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded-md flex items-center gap-0.5">
                    <Bell className="w-2.5 h-2.5" />
                    <span>-{task.reminderMinutesBefore}м</span>
                  </span>
                ) : null}
              </span>
            )}
          </div>

          <h4
            onClick={() => onToggleTask(task.id)}
            className={`text-sm leading-snug cursor-pointer select-none transition-all ${
              task.completed
                ? 'line-through text-slate-400'
                : isOverdue
                ? 'text-rose-950 font-black'
                : 'text-slate-800 font-bold'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${
              isOverdue ? 'text-rose-900/80 font-medium' : 'text-[#595959]'
            }`}>
              {task.description}
            </p>
          )}

          {/* Subtasks summary bar */}
          {subtasks.length > 0 && (
            <div className={`mt-2 pt-2 border-t flex items-center justify-between ${
              isOverdue ? 'border-rose-200' : 'border-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  isOverdue ? 'text-rose-800 hover:text-rose-950' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Чек-лист: {completedSubtasksCount}/{subtasks.length}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <div className={`w-20 h-1.5 rounded-full overflow-hidden ${
                isOverdue ? 'bg-rose-200/70' : 'bg-slate-100'
              }`}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedSubtasksCount / subtasks.length) * 100}%`,
                    backgroundColor: isOverdue ? '#f43f5e' : theme.primary
                  }}
                />
              </div>
            </div>
          )}

          {/* Expanded Subtasks List */}
          {isExpanded && subtasks.length > 0 && (
            <div className={`mt-2.5 space-y-1.5 pl-1 border-l-2 ${
              isOverdue ? 'border-rose-300' : 'border-slate-200'
            }`}>
              {subtasks.map(st => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(task.id, st.id)}
                  className={`flex items-center gap-2 text-xs py-1 px-1 rounded-lg cursor-pointer ${
                    isOverdue ? 'text-rose-900 hover:bg-rose-100/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    style={st.completed ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      st.completed ? 'text-white' : isOverdue ? 'border-rose-300 bg-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`select-none ${st.completed ? 'line-through opacity-50' : 'font-medium'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Actions (Edit, Delete) */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className={`p-1.5 rounded-xl transition-transform active:scale-90 cursor-pointer ${
              isOverdue
                ? 'text-rose-400 hover:text-rose-800 hover:bg-rose-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Редактировать задачу"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className={`p-1.5 rounded-xl transition-transform active:scale-90 cursor-pointer ${
              isOverdue
                ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-100'
                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
            }`}
            title="Удалить задачу"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
