import React, { useState, useEffect } from 'react';
import type { Pill, PillCategory, PillScheduleType } from '../../types';
import { getTodayString, addDays, diffInDays, formatFullRussianDate } from '../../utils/dateUtils';
import { X, Plus, Trash2, Check, Clock, Pill as PillIcon, Sun, Heart, Leaf, Calendar } from 'lucide-react';

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
  const todayStr = getTodayString();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 табл.');
  const [category, setCategory] = useState<PillCategory>('pill');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [scheduleType, setScheduleType] = useState<PillScheduleType>('everyday');
  const [color, setColor] = useState('#8b5cf6');
  const [notes, setNotes] = useState('');

  // Course duration fields
  const [isCourse, setIsCourse] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState(todayStr);
  const [courseDurationDays, setCourseDurationDays] = useState(14);
  const [courseEndDate, setCourseEndDate] = useState('');

  useEffect(() => {
    if (pillToEdit) {
      setName(pillToEdit.name);
      setDosage(pillToEdit.dosage);
      setCategory(pillToEdit.category);
      setTimes(pillToEdit.times || ['09:00']);
      setScheduleType(pillToEdit.scheduleType || 'everyday');
      setColor(pillToEdit.color || '#8b5cf6');
      setNotes(pillToEdit.notes || '');

      setIsCourse(pillToEdit.isCourse ?? Boolean(pillToEdit.courseEndDate));
      setCourseStartDate(pillToEdit.courseStartDate || todayStr);
      setCourseDurationDays(pillToEdit.courseDurationDays || 14);
      setCourseEndDate(pillToEdit.courseEndDate || (pillToEdit.courseDurationDays ? addDays(pillToEdit.courseStartDate || todayStr, (pillToEdit.courseDurationDays || 14) - 1) : addDays(todayStr, 13)));
    } else {
      setName('');
      setDosage('1 табл.');
      setCategory('pill');
      setTimes(['09:00']);
      setScheduleType('everyday');
      setColor('#8b5cf6');
      setNotes('');

      setIsCourse(false);
      setCourseStartDate(todayStr);
      setCourseDurationDays(14);
      setCourseEndDate(addDays(todayStr, 13));
    }
  }, [pillToEdit, isOpen, todayStr]);

  if (!isOpen) return null;

  const categories: { id: PillCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'pill', label: 'Таблетки', icon: <PillIcon className="w-4 h-4 text-purple-600" /> },
    { id: 'vitamin', label: 'Витамины', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'contraceptive', label: 'КОК / Контрацепция', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { id: 'supplement', label: 'БАД / Добавка', icon: <Leaf className="w-4 h-4 text-emerald-600" /> }
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

    const finalEndDate = isCourse ? (courseEndDate || addDays(courseStartDate, courseDurationDays - 1)) : undefined;

    onSave({
      ...(pillToEdit ? { id: pillToEdit.id } : {}),
      name: name.trim(),
      dosage: dosage.trim() || '1 табл.',
      category,
      times,
      scheduleType,
      color,
      notes: notes.trim(),
      active: true,
      isCourse,
      courseStartDate: isCourse ? courseStartDate : undefined,
      courseDurationDays: isCourse ? courseDurationDays : undefined,
      courseEndDate: finalEndDate
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
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-2xs">
                    {c.icon}
                  </div>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Course duration section */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Курсовой приём</h4>
                  <p className="text-[10px] text-slate-500">Задать длительность и дату окончания</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isCourse}
                onChange={e => setIsCourse(e.target.checked)}
                className="w-5 h-5 rounded-md accent-purple-600 cursor-pointer"
              />
            </div>

            {isCourse && (
              <div className="space-y-3 pt-2 border-t border-purple-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Старт курса
                    </label>
                    <input
                      type="date"
                      value={courseStartDate}
                      onChange={e => {
                        const newStart = e.target.value;
                        setCourseStartDate(newStart);
                        setCourseEndDate(addDays(newStart, courseDurationDays - 1));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Окончание (до какого)
                    </label>
                    <input
                      type="date"
                      value={courseEndDate}
                      onChange={e => {
                        const newEnd = e.target.value;
                        setCourseEndDate(newEnd);
                        const diff = diffInDays(newEnd, courseStartDate) + 1;
                        if (diff > 0) setCourseDurationDays(diff);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Quick duration presets */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Быстрый выбор длительности:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[7, 10, 14, 21, 30, 60, 90].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          setCourseDurationDays(days);
                          setCourseEndDate(addDays(courseStartDate, days - 1));
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          courseDurationDays === days
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {days < 30 ? `${days} дн.` : days === 30 ? '1 мес.' : days === 60 ? '2 мес.' : '3 мес.'}
                      </button>
                    ))}
                  </div>
                </div>

                {courseEndDate && (
                  <div className="p-2.5 rounded-xl bg-white text-xs font-medium text-purple-900 border border-purple-100 flex items-center justify-between">
                    <span>Пить до: <strong className="font-bold">{formatFullRussianDate(courseEndDate)}</strong></span>
                    <span className="text-[10px] font-bold bg-purple-100 px-2 py-0.5 rounded-full text-purple-700">
                      {courseDurationDays} дн.
                    </span>
                  </div>
                )}
              </div>
            )}
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
              title="Удалить препарат"
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
