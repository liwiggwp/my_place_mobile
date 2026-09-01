import React, { useState, useEffect } from 'react';
import type { Pill, PillCategory, PillScheduleType } from '../../types';
import { X, Plus, Trash2, Check, Clock } from 'lucide-react';

interface PillModalProps {
  isOpen: boolean;
  pillToEdit?: Pill | null;
  onSave: (pill: Partial<Pill>) => void;
  onDelete?: (pillId: string) => void;
  onClose: () => void;
}

export const PillModal: React.FC<PillModalProps> = ({
  isOpen,
  pillToEdit,
  onSave,
  onDelete,
  onClose
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 табл.');
  const [category, setCategory] = useState<PillCategory>('pill');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [scheduleType, setScheduleType] = useState<PillScheduleType>('everyday');
  const [color, setColor] = useState('#8b5cf6');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (pillToEdit) {
      setName(pillToEdit.name);
      setDosage(pillToEdit.dosage);
      setCategory(pillToEdit.category);
      setTimes(pillToEdit.times || ['09:00']);
      setScheduleType(pillToEdit.scheduleType || 'everyday');
      setColor(pillToEdit.color || '#8b5cf6');
      setNotes(pillToEdit.notes || '');
    } else {
      setName('');
      setDosage('1 табл.');
      setCategory('pill');
      setTimes(['09:00']);
      setScheduleType('everyday');
      setColor('#8b5cf6');
      setNotes('');
    }
  }, [pillToEdit, isOpen]);

  if (!isOpen) return null;

  const categories: { id: PillCategory; label: string; icon: string }[] = [
    { id: 'pill', label: 'Таблетки', icon: '💊' },
    { id: 'vitamin', label: 'Витамины', icon: '☀️' },
    { id: 'contraceptive', label: 'КОК / Контрацепция', icon: '🌸' },
    { id: 'supplement', label: 'БАД / Добавка', icon: '🌿' }
  ];

  const colors = [
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#6366f1'
  ];

  const handleAddTime = () => {
    if (times.length < 5) {
      setTimes(prev => [...prev, '20:00']);
    }
  };

  const handleRemoveTime = (index: number) => {
    if (times.length > 1) {
      setTimes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    setTimes(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(pillToEdit ? { id: pillToEdit.id } : {}),
      name: name.trim(),
      dosage: dosage.trim() || '1 табл.',
      category,
      times,
      scheduleType,
      color,
      notes: notes.trim(),
      active: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-purple-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {pillToEdit ? 'Редактировать препарат' : 'Новое напоминание'}
            </h3>
            <p className="text-xs text-purple-500 font-semibold">Установите время и дозировку</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 transition-transform cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-1 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Название препарата *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Витамин D3, Омега-3, Джес..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Категория
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                    category === c.id
                      ? 'bg-purple-100/70 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dosage & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Дозировка
              </label>
              <input
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="1 табл."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Примечание
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="После еды"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Times */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Время приема</span>
              </label>
              {times.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить время
                </button>
              )}
            </div>

            <div className="space-y-2">
              {times.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={e => handleTimeChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-500 active:scale-90 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Цветовая метка
            </label>
            <div className="flex items-center gap-2 py-1">
              {colors.map(c => {
                const isSelected = color === c;
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center cursor-pointer ${
                      isSelected ? 'border-2 border-slate-900 shadow-sm' : 'border border-black/10'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
          {pillToEdit && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(pillToEdit.id);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-90 transition-transform cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-300/40 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{pillToEdit ? 'Сохранить изменения' : 'Добавить лекарство'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
