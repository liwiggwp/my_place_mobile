import React, { useState } from 'react';
import type { NotionItem, NotionProperty, NotionBlock, BlockType } from '../../types/notion';
import {
  X,
  Trash2,
  Calendar,
  Tag,
  Hash,
  CheckSquare,
  Star,
  Type,
  Plus,
  Check
} from 'lucide-react';
import { AddBlockModal } from './AddBlockModal';

interface DatabaseItemModalProps {
  isOpen: boolean;
  item: NotionItem | null;
  properties: NotionProperty[];
  defaultDate?: string;
  defaultStatusId?: string;
  onSave: (item: NotionItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const DatabaseItemModal: React.FC<DatabaseItemModalProps> = ({
  isOpen,
  item,
  properties,
  defaultDate,
  defaultStatusId,
  onSave,
  onDelete,
  onClose
}) => {
  const isEditing = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [propValues, setPropValues] = useState<Record<string, any>>(() => {
    const initial = item?.properties ? { ...item.properties } : {};
    if (!item && defaultDate) {
      const dateProp = properties.find(p => p.type === 'date');
      if (dateProp) initial[dateProp.id] = defaultDate;
    }
    if (!item && defaultStatusId) {
      const statusProp = properties.find(p => p.type === 'select');
      if (statusProp) initial[statusProp.id] = defaultStatusId;
    }
    return initial;
  });

  const [blocks, setBlocks] = useState<NotionBlock[]>(item?.blocks || []);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  if (!isOpen) return null;

  const handleSetPropValue = (propId: string, val: any) => {
    setPropValues(prev => ({ ...prev, [propId]: val }));
  };

  const handleAddBlock = (type: BlockType, extra?: { icon?: string; color?: string; widgetType?: string }) => {
    const newBlock: NotionBlock = {
      id: `blk-${Date.now()}`,
      type,
      content: '',
      checked: false,
      icon: extra?.icon || (type === 'callout' ? '💡' : undefined),
      color: extra?.color || (type === 'callout' ? 'indigo' : undefined),
      widgetType: extra?.widgetType as any,
      createdAt: new Date().toISOString()
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, content } : b)));
  };

  const handleToggleTodo = (id: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, checked: !b.checked } : b)));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const savedItem: NotionItem = {
      id: item?.id || `item-${Date.now()}`,
      title: title.trim(),
      properties: propValues,
      blocks,
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isEditing ? 'Редактировать запись' : 'Новая запись'}
          </span>
          <div className="flex items-center gap-1">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Удалить эту запись?')) {
                    onDelete(item!.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Удалить"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Title input */}
          <div>
            <input
              type="text"
              placeholder="Название записи..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xl sm:text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-hidden border-b border-slate-100 pb-2"
              autoFocus={!isEditing}
            />
          </div>

          {/* Properties Grid */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Свойства записи
            </span>

            <div className="space-y-2.5">
              {properties.map(prop => {
                const val = propValues[prop.id];

                return (
                  <div key={prop.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 font-semibold shrink-0 w-28 truncate flex items-center gap-1.5">
                      {prop.type === 'select' && <Tag className="w-3.5 h-3.5 text-blue-500" />}
                      {prop.type === 'date' && <Calendar className="w-3.5 h-3.5 text-indigo-500" />}
                      {prop.type === 'number' && <Hash className="w-3.5 h-3.5 text-emerald-500" />}
                      {prop.type === 'rating' && <Star className="w-3.5 h-3.5 text-amber-500" />}
                      {prop.type === 'checkbox' && <CheckSquare className="w-3.5 h-3.5 text-purple-500" />}
                      {prop.type === 'text' && <Type className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{prop.name}</span>
                    </span>

                    {/* SELECT / TAG */}
                    {prop.type === 'select' && (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {(prop.options || []).map(opt => {
                          const isSelected = val === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSetPropValue(prop.id, isSelected ? undefined : opt.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? `${opt.color} ring-2 ring-indigo-400 shadow-2xs`
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* DATE */}
                    {prop.type === 'date' && (
                      <input
                        type="date"
                        value={val || ''}
                        onChange={e => handleSetPropValue(prop.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      />
                    )}

                    {/* NUMBER */}
                    {prop.type === 'number' && (
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={val !== undefined ? val : ''}
                        onChange={e => handleSetPropValue(prop.id, e.target.value.replace(/[^0-9.,]/g, ''))}
                        className="w-28 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 text-right focus:outline-hidden"
                      />
                    )}

                    {/* RATING */}
                    {prop.type === 'rating' && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSetPropValue(prop.id, (val || 0) === star ? 0 : star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                (val || 0) >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* CHECKBOX */}
                    {prop.type === 'checkbox' && (
                      <button
                        type="button"
                        onClick={() => handleSetPropValue(prop.id, !val)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                          val ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300'
                        }`}
                      >
                        {val && <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* TEXT */}
                    {prop.type === 'text' && (
                      <input
                        type="text"
                        placeholder="Значение..."
                        value={val || ''}
                        onChange={e => handleSetPropValue(prop.id, e.target.value)}
                        className="w-44 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Blocks / Page Content */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Содержимое страницы
              </span>
              <button
                type="button"
                onClick={() => setIsAddBlockOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить блок</span>
              </button>
            </div>

            {blocks.length === 0 ? (
              <div
                onClick={() => setIsAddBlockOpen(true)}
                className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Страница пуста. Нажмите, чтобы добавить заметки, чеклист или цитату.
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map(block => (
                  <div key={block.id} className="group relative flex items-start gap-2">
                    {/* Block Render */}
                    {block.type === 'heading1' && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                        placeholder="Заголовок 1..."
                        className="w-full text-lg font-black text-slate-900 focus:outline-hidden"
                      />
                    )}
                    {block.type === 'heading2' && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                        placeholder="Заголовок 2..."
                        className="w-full text-base font-extrabold text-slate-800 focus:outline-hidden"
                      />
                    )}
                    {block.type === 'heading3' && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                        placeholder="Заголовок 3..."
                        className="w-full text-sm font-bold text-slate-700 focus:outline-hidden"
                      />
                    )}
                    {block.type === 'text' && (
                      <textarea
                        rows={2}
                        value={block.content}
                        onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                        placeholder="Введите текст..."
                        className="w-full text-xs font-normal text-slate-700 focus:outline-hidden resize-none"
                      />
                    )}
                    {block.type === 'todo' && (
                      <div className="flex items-center gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={() => handleToggleTodo(block.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
                            block.checked ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300'
                          }`}
                        >
                          {block.checked && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="text"
                          value={block.content}
                          onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                          placeholder="Задача..."
                          className={`w-full text-xs font-semibold focus:outline-hidden ${
                            block.checked ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        />
                      </div>
                    )}
                    {block.type === 'callout' && (
                      <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 w-full">
                        <span className="text-base shrink-0">{block.icon || '💡'}</span>
                        <input
                          type="text"
                          value={block.content}
                          onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                          placeholder="Важная мысль..."
                          className="w-full text-xs font-semibold text-indigo-950 bg-transparent focus:outline-hidden"
                        />
                      </div>
                    )}
                    {block.type === 'bullet' && (
                      <div className="flex items-center gap-2 w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-1" />
                        <input
                          type="text"
                          value={block.content}
                          onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                          placeholder="Пункт списка..."
                          className="w-full text-xs font-medium text-slate-700 focus:outline-hidden"
                        />
                      </div>
                    )}
                    {block.type === 'quote' && (
                      <div className="pl-3 border-l-2 border-purple-400 w-full italic text-xs text-purple-900">
                        <input
                          type="text"
                          value={block.content}
                          onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                          placeholder="Цитата..."
                          className="w-full bg-transparent focus:outline-hidden italic"
                        />
                      </div>
                    )}
                    {block.type === 'divider' && (
                      <hr className="w-full my-2 border-slate-200" />
                    )}

                    {/* Delete block button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Сохранить</span>
          </button>
        </div>

      </div>

      <AddBlockModal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        onSelectBlockType={handleAddBlock}
      />
    </div>
  );
};
