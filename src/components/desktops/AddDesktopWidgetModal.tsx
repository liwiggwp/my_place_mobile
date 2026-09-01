import React, { useState } from 'react';
import type { WidgetConfig, WidgetSize, WidgetType, TaskCategoryItem } from '../../types';
import {
  X,
  Plus,
  Sparkles,
  Clock,
  CheckSquare,
  Droplets,
  Heart,
  Pill as PillIcon,
  Lightbulb,
  Image as ImageIcon,
  Minus,
  Square
} from 'lucide-react';

interface AddDesktopWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (
    type: WidgetType,
    size: WidgetSize,
    taskCategoryFilter?: string,
    dividerStyle?: 'blank' | 'line',
    imageUrl?: string
  ) => void;
  activeWidgets: WidgetConfig[];
  taskCategories?: TaskCategoryItem[];
}

interface WidgetTemplate {
  type: WidgetType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultSize: WidgetSize;
  description: string;
}

const AVAILABLE_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'clock',
    title: 'Часы и Время',
    subtitle: 'Живые часы, дата и прогресс дня',
    icon: <Clock className="w-5 h-5 text-indigo-600" />,
    defaultSize: 'small',
    description: 'Отображает текущее время с секундами, день недели, дату и шкалу прогресса рабочего дня.'
  },
  {
    type: 'tasks',
    title: 'Задачи и Планы',
    subtitle: 'План на день и фильтр категорий',
    icon: <CheckSquare className="w-5 h-5 text-blue-600" />,
    defaultSize: 'medium',
    description: 'Интерактивный список дел на сегодня, чек-лист подзадач и возможность фильтрации по проекту.'
  },
  {
    type: 'pills',
    title: 'Лекарства и Витамины',
    subtitle: 'Напоминания и график приёма',
    icon: <PillIcon className="w-5 h-5 text-purple-600" />,
    defaultSize: 'medium',
    description: 'Ближайший приём таблеток или витаминов и отметка приема в 1 клик.'
  },
  {
    type: 'water',
    title: 'Водный Баланс',
    subtitle: 'Трекер выпитой воды и норма',
    icon: <Droplets className="w-5 h-5 text-sky-500" />,
    defaultSize: 'medium',
    description: 'Прогресс нормы воды за день и быстрые кнопки добавления +250 мл.'
  },
  {
    type: 'cycle',
    title: 'Мой Цикл & Календарь',
    subtitle: 'Фаза, дни цикла и календарь',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    defaultSize: 'large',
    description: 'Показывает день цикла, прогноз месячных, окно фертильности и интерактивную сетку календаря.'
  },
  {
    type: 'photo',
    title: 'Моё фото / Картинка',
    subtitle: 'Любое фото с телефона или ПК',
    icon: <ImageIcon className="w-5 h-5 text-indigo-600" />,
    defaultSize: 'small',
    description: 'Вставьте любимое фото, картинку или эстетичный постер в любое место рабочего стола.'
  },
  {
    type: 'tip',
    title: 'Совет Дня',
    subtitle: 'Рекомендации и вдохновение',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    defaultSize: 'small',
    description: 'Полезные советы и ежедневные напоминания о здоровье, концентрации и отдыхе.'
  },
  {
    type: 'divider',
    title: 'Дивидер / Отступ',
    subtitle: 'Разделитель или пространство',
    icon: <Minus className="w-5 h-5 text-slate-500" />,
    defaultSize: 'small',
    description: 'Создает аккуратное разделение или пустое расстояние между блоками.'
  }
];

export const AddDesktopWidgetModal: React.FC<AddDesktopWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  activeWidgets,
  taskCategories = []
}) => {
  const [selectedType, setSelectedType] = useState<WidgetType>('clock');
  const [selectedSize, setSelectedSize] = useState<WidgetSize>('small');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [dividerStyle, setDividerStyle] = useState<'blank' | 'line'>('blank');

  if (!isOpen) return null;

  const currentTemplate = AVAILABLE_TEMPLATES.find(t => t.type === selectedType) || AVAILABLE_TEMPLATES[0];

  const availableSizes: WidgetSize[] =
    selectedType === 'photo' ? ['small', 'large'] : ['small', 'medium', 'large'];

  const handleAdd = () => {
    onAddWidget(
      selectedType,
      selectedSize,
      selectedType === 'tasks' ? selectedCategoryFilter || undefined : undefined,
      selectedType === 'divider' ? dividerStyle : undefined
    );
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#203A5F]" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Галерея элементов</h3>
              <p className="text-xs text-[#203A5F] font-semibold">Выберите элемент для рабочего стола</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Gallery Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-4 space-y-4">
          {/* Widget Cards Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            {AVAILABLE_TEMPLATES.map(template => {
              const isSelected = selectedType === template.type;
              const isActive =
                template.type !== 'divider' &&
                template.type !== 'photo' &&
                template.type !== 'tasks' &&
                template.type !== 'clock' &&
                activeWidgets.some(w => w.type === template.type && w.enabled);

              return (
                <button
                  key={template.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(template.type);
                    setSelectedSize(template.defaultSize);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#203A5F] bg-[#203A5F]/5 shadow-xs'
                      : 'border border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      {template.icon}
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        На экране
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{template.title}</h4>
                    <p className="text-[10px] text-[#595959] line-clamp-1 mt-0.5">{template.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Task Category Filter Option (only for Tasks) */}
          {selectedType === 'tasks' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 animate-fade-in">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Фильтр задач для этого виджета
              </span>
              <p className="text-xs text-blue-700/80">
                Вы можете сделать виджет только для рабочих задач, по здоровью или для всех.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === ''
                      ? 'bg-[#203A5F] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Все задачи
                </button>
                {taskCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-[#203A5F] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider Style Picker */}
          {selectedType === 'divider' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">Тип разделителя / отступа:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDividerStyle('blank')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    dividerStyle === 'blank'
                      ? 'bg-[#203A5F] text-white border-[#203A5F] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>Пустой отступ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDividerStyle('line')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    dividerStyle === 'line'
                      ? 'bg-[#203A5F] text-white border-[#203A5F] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Линия</span>
                </button>
              </div>
            </div>
          )}

          {/* Size Selector (Shown for widgets and blank spacer, hidden for line divider) */}
          {(selectedType !== 'divider' || dividerStyle === 'blank') && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                {selectedType === 'divider' ? 'Высота отступа:' : selectedType === 'photo' ? 'Размер фото:' : 'Размер виджета:'}
              </label>
              <div className={`grid ${availableSizes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                {availableSizes.map(size => {
                  const isSizeSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        isSizeSelected
                          ? 'bg-[#203A5F] text-white border-[#203A5F] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {size === 'small' && (selectedType === 'photo' ? 'S (1x1 Квадрат)' : selectedType === 'divider' ? 'S (Компактный)' : 'S (Маленький)')}
                      {size === 'medium' && (selectedType === 'divider' ? 'M (Средний)' : 'M (Средний)')}
                      {size === 'large' && (selectedType === 'photo' ? 'L (Большой постер)' : selectedType === 'divider' ? 'L (Большой)' : 'L (Большой)')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Description */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-[#595959] flex items-start gap-2">
            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              {currentTemplate.icon}
            </div>
            <p className="leading-tight">{currentTemplate.description}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-2xl bg-[#203A5F] hover:bg-[#1a2f4d] text-white font-bold text-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить на рабочий стол</span>
          </button>
        </div>
      </div>
    </div>
  );
};
