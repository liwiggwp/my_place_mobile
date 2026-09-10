import React from 'react';
import type { BlockType } from '../../types/notion';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Sparkles,
  List,
  ListOrdered,
  Quote,
  Minus,
  X
} from 'lucide-react';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlockType: (type: BlockType, extra?: { icon?: string; color?: string; widgetType?: string }) => void;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onSelectBlockType
}) => {
  if (!isOpen) return null;

  const basicBlocks = [
    { type: 'text' as BlockType, title: 'Текст', desc: 'Обычный абзац или заметка', icon: Type, color: 'text-slate-600 bg-slate-100' },
    { type: 'heading1' as BlockType, title: 'Заголовок 1', desc: 'Крупный заголовок раздела', icon: Heading1, color: 'text-indigo-600 bg-indigo-50' },
    { type: 'heading2' as BlockType, title: 'Заголовок 2', desc: 'Подзаголовок среднего размера', icon: Heading2, color: 'text-blue-600 bg-blue-50' },
    { type: 'heading3' as BlockType, title: 'Заголовок 3', desc: 'Малый подзаголовок', icon: Heading3, color: 'text-teal-600 bg-teal-50' },
    { type: 'todo' as BlockType, title: 'Чек-лист (To-do)', desc: 'Интерактивная задача с галочкой', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
    { type: 'callout' as BlockType, title: 'Выноска (Callout)', desc: 'Цветная карточка с эмодзи для акцентов', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { type: 'bullet' as BlockType, title: 'Маркированный список', desc: 'Простой список с точками', icon: List, color: 'text-slate-600 bg-slate-100' },
    { type: 'numbered' as BlockType, title: 'Нумерованный список', desc: 'Список 1, 2, 3...', icon: ListOrdered, color: 'text-slate-600 bg-slate-100' },
    { type: 'quote' as BlockType, title: 'Цитата', desc: 'Блок для цитат и вдохновения', icon: Quote, color: 'text-purple-600 bg-purple-50' },
    { type: 'divider' as BlockType, title: 'Разделитель', desc: 'Тонкая черта для разделения мыслей', icon: Minus, color: 'text-slate-400 bg-slate-100' }
  ];

  const widgetBlocks = [
    { widgetType: 'finance', title: 'Виджет Финансов', desc: 'Баланс и быстрые операции', icon: '💳' },
    { widgetType: 'tasks', title: 'Виджет Задач', desc: 'Список дел на сегодня', icon: '✅' },
    { widgetType: 'water', title: 'Виджет Воды', desc: 'Дневная норма и прогресс', icon: '💧' },
    { widgetType: 'pills', title: 'Виджет Таблеток', desc: 'Прием витаминов и лекарств', icon: '💊' },
    { widgetType: 'cycle', title: 'Виджет Цикла', desc: 'Фаза и день цикла', icon: '🌸' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div>
            <h3 className="text-base font-black text-slate-900">Добавить блок</h3>
            <p className="text-xs text-slate-500 font-semibold">Выберите тип элемента для вашей страницы</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Basic Blocks */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
              Основные блоки
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {basicBlocks.map(b => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.type}
                    onClick={() => {
                      onSelectBlockType(b.type);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-left transition-all active:scale-98 cursor-pointer shadow-2xs group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block truncate">
                        {b.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium line-clamp-1 block">
                        {b.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embedded Widgets */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
              Встроенные виджеты
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {widgetBlocks.map(w => (
                <button
                  key={w.widgetType}
                  onClick={() => {
                    onSelectBlockType('embed_widget', { widgetType: w.widgetType });
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-left transition-all active:scale-98 cursor-pointer shadow-2xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                    {w.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block truncate">
                      {w.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1 block">
                      {w.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
