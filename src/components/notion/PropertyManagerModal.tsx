import React, { useState } from 'react';
import type { NotionProperty, PropertyType, PropertyOption } from '../../types/notion';
import {
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  Tag,
  Calendar,
  Hash,
  CheckSquare,
  Star,
  Type,
  Check
} from 'lucide-react';

interface PropertyManagerModalProps {
  isOpen: boolean;
  properties: NotionProperty[];
  onSaveProperties: (properties: NotionProperty[]) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { id: 'blue', label: 'Синий', class: 'bg-blue-100 text-blue-800' },
  { id: 'emerald', label: 'Зеленый', class: 'bg-emerald-100 text-emerald-800' },
  { id: 'amber', label: 'Желтый', class: 'bg-amber-100 text-amber-800' },
  { id: 'rose', label: 'Красный', class: 'bg-rose-100 text-rose-800' },
  { id: 'purple', label: 'Фиолетовый', class: 'bg-purple-100 text-purple-800' },
  { id: 'indigo', label: 'Индиго', class: 'bg-indigo-100 text-indigo-800' },
  { id: 'slate', label: 'Серый', class: 'bg-slate-100 text-slate-800' }
];

export const PropertyManagerModal: React.FC<PropertyManagerModalProps> = ({
  isOpen,
  properties,
  onSaveProperties,
  onClose
}) => {
  const [propsList, setPropsList] = useState<NotionProperty[]>(properties);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('select');
  const [editingPropId, setEditingPropId] = useState<string | null>(null);

  // New option state for select/multi_select
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionColor, setNewOptionColor] = useState(COLOR_PRESETS[0].class);

  if (!isOpen) return null;

  const propertyTypes: { type: PropertyType; label: string; icon: any }[] = [
    { type: 'select', label: 'Статус / Выбор (Select)', icon: Tag },
    { type: 'multi_select', label: 'Мульти-теги (Multi-Select)', icon: Tag },
    { type: 'date', label: 'Дата / Дедлайн (Date)', icon: Calendar },
    { type: 'number', label: 'Число / Валюта (Number)', icon: Hash },
    { type: 'checkbox', label: 'Флажок (Checkbox)', icon: CheckSquare },
    { type: 'rating', label: 'Рейтинг 1-5 звезд (Rating)', icon: Star },
    { type: 'text', label: 'Текст (Text)', icon: Type }
  ];

  const handleAddProperty = () => {
    if (!newPropName.trim()) return;

    const newProp: NotionProperty = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      type: newPropType,
      options: newPropType === 'select' || newPropType === 'multi_select'
        ? [
            { id: `opt-1`, label: 'В планах', color: 'bg-amber-100 text-amber-800' },
            { id: `opt-2`, label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
            { id: `opt-3`, label: 'Готово', color: 'bg-emerald-100 text-emerald-800' }
          ]
        : undefined
    };

    setPropsList(prev => [...prev, newProp]);
    setNewPropName('');
  };

  const handleDeleteProperty = (id: string) => {
    setPropsList(prev => prev.filter(p => p.id !== id));
    if (editingPropId === id) setEditingPropId(null);
  };

  const handleAddOptionToProp = (propId: string) => {
    if (!newOptionLabel.trim()) return;

    setPropsList(prev =>
      prev.map(p => {
        if (p.id !== propId) return p;
        const newOpt: PropertyOption = {
          id: `opt-${Date.now()}`,
          label: newOptionLabel.trim(),
          color: newOptionColor
        };
        return {
          ...p,
          options: [...(p.options || []), newOpt]
        };
      })
    );

    setNewOptionLabel('');
  };

  const handleDeleteOption = (propId: string, optId: string) => {
    setPropsList(prev =>
      prev.map(p => {
        if (p.id !== propId) return p;
        return {
          ...p,
          options: (p.options || []).filter(o => o.id !== optId)
        };
      })
    );
  };

  const handleSave = () => {
    onSaveProperties(propsList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Свойства базы данных</h3>
              <p className="text-xs text-slate-500 font-semibold">Настройте поля, колонки и теги</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          
          {/* List of existing properties */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
              Текущие свойства ({propsList.length})
            </span>

            {propsList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-400">
                Свойств пока нет. Добавьте первое свойство ниже!
              </div>
            ) : (
              <div className="space-y-2">
                {propsList.map(prop => {
                  const typeObj = propertyTypes.find(t => t.type === prop.type);
                  const Icon = typeObj?.icon || Type;
                  const isEditingThis = editingPropId === prop.id;

                  return (
                    <div
                      key={prop.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate block">
                              {prop.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {typeObj?.label.split('(')[0].trim()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {(prop.type === 'select' || prop.type === 'multi_select') && (
                            <button
                              onClick={() => setEditingPropId(isEditingThis ? null : prop.id)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              {isEditingThis ? 'Закрыть' : 'Теги'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProperty(prop.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Удалить свойство"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options Editor for Select & Multi-Select */}
                      {isEditingThis && (prop.type === 'select' || prop.type === 'multi_select') && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-fade-in">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Варианты выбора (Теги)
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {(prop.options || []).map(opt => (
                              <span
                                key={opt.id}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${opt.color}`}
                              >
                                {opt.label}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOption(prop.id, opt.id)}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Add option */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Новый тег..."
                              value={newOptionLabel}
                              onChange={e => setNewOptionLabel(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                            />
                            <select
                              value={newOptionColor}
                              onChange={e => setNewOptionColor(e.target.value)}
                              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                            >
                              {COLOR_PRESETS.map(c => (
                                <option key={c.id} value={c.class}>{c.label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddOptionToProp(prop.id)}
                              className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Property Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <span className="text-xs font-black text-slate-800 block">
              + Добавить новое свойство
            </span>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Название колонки
                </label>
                <input
                  type="text"
                  placeholder="Например: Статус, Дедлайн, Оценка, Цена..."
                  value={newPropName}
                  onChange={e => setNewPropName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Тип поля
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {propertyTypes.map(t => {
                    const Icon = t.icon;
                    const isSelected = newPropType === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setNewPropType(t.type)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                            : 'bg-white border-slate-200/70 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-bold truncate">{t.label.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddProperty}
                disabled={!newPropName.trim()}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить свойство</span>
              </button>
            </div>
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
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Сохранить</span>
          </button>
        </div>

      </div>
    </div>
  );
};
