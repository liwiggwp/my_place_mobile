import React, { useState, useRef } from 'react';
import type { TaskCategoryItem, DualColorTheme } from '../../types';
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  categories: TaskCategoryItem[];
  theme?: DualColorTheme;
  onSaveCategories: (categories: TaskCategoryItem[]) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Blue', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Cyan', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Emerald', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Green', class: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Amber', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Orange', class: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Rose', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Pink', class: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Purple', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Violet', class: 'bg-violet-50 text-violet-700 border-violet-200' },
  { name: 'Fuchsia', class: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  { name: 'Teal', class: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Sky', class: 'bg-sky-50 text-sky-700 border-sky-200' },
  { name: 'Zinc', class: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  { name: 'Slate', class: 'bg-slate-100 text-slate-700 border-slate-200' }
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  categories,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onSaveCategories,
  onClose
}) => {
  const [list, setList] = useState<TaskCategoryItem[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState(PRESET_COLORS[0].class);

  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0].class);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Drag-to-scroll refs for Edit color bar
  const editColorBarRef = useRef<HTMLDivElement>(null);
  const isDraggingEditColor = useRef(false);
  const startXEditColor = useRef(0);
  const scrollLeftEditColor = useRef(0);
  const hasMovedEditColor = useRef(false);

  // Drag-to-scroll refs for New color bar
  const newColorBarRef = useRef<HTMLDivElement>(null);
  const isDraggingNewColor = useRef(false);
  const startXNewColor = useRef(0);
  const scrollLeftNewColor = useRef(0);
  const hasMovedNewColor = useRef(false);

  if (!isOpen) return null;

  /* Mouse drag-to-scroll handlers for Edit Colors */
  const handleEditColorMouseDown = (e: React.MouseEvent) => {
    if (!editColorBarRef.current) return;
    isDraggingEditColor.current = true;
    hasMovedEditColor.current = false;
    startXEditColor.current = e.pageX - editColorBarRef.current.offsetLeft;
    scrollLeftEditColor.current = editColorBarRef.current.scrollLeft;
  };

  const handleEditColorMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingEditColor.current || !editColorBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - editColorBarRef.current.offsetLeft;
    const walk = (x - startXEditColor.current) * 1.5;
    if (Math.abs(walk) > 4) hasMovedEditColor.current = true;
    editColorBarRef.current.scrollLeft = scrollLeftEditColor.current - walk;
  };

  const handleEditColorMouseUpOrLeave = () => {
    isDraggingEditColor.current = false;
  };

  /* Mouse drag-to-scroll handlers for New Colors */
  const handleNewColorMouseDown = (e: React.MouseEvent) => {
    if (!newColorBarRef.current) return;
    isDraggingNewColor.current = true;
    hasMovedNewColor.current = false;
    startXNewColor.current = e.pageX - newColorBarRef.current.offsetLeft;
    scrollLeftNewColor.current = newColorBarRef.current.scrollLeft;
  };

  const handleNewColorMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingNewColor.current || !newColorBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - newColorBarRef.current.offsetLeft;
    const walk = (x - startXNewColor.current) * 1.5;
    if (Math.abs(walk) > 4) hasMovedNewColor.current = true;
    newColorBarRef.current.scrollLeft = scrollLeftNewColor.current - walk;
  };

  const handleNewColorMouseUpOrLeave = () => {
    isDraggingNewColor.current = false;
  };

  const handleWheelHorizontal = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
  };

  const handleStartEdit = (cat: TaskCategoryItem) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditColor(cat.color || PRESET_COLORS[0].class);
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim()) return;
    setList(prev =>
      prev.map(c =>
        c.id === editingId
          ? { ...c, label: editLabel.trim(), color: editColor }
          : c
      )
    );
    setEditingId(null);
  };

  const handleAddNew = () => {
    if (!newLabel.trim()) return;
    const newCat: TaskCategoryItem = {
      id: 'cat-' + Date.now(),
      label: newLabel.trim(),
      color: newColor,
      isDefault: false
    };
    const updated = [...list, newCat];
    setList(updated);
    setNewLabel('');
    setIsAddingNew(false);
    onSaveCategories(updated);
  };

  const handleDelete = (id: string) => {
    const updated = list.filter(c => c.id !== id);
    setList(updated);
    onSaveCategories(updated);
  };

  const handleSaveAll = () => {
    onSaveCategories(list);
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
            <div
              style={{ backgroundColor: `${theme.primary}15` }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
            >
              <Tag className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Категории задач</h3>
              <p className="text-xs text-slate-500 font-semibold">Настройка списка и цветов</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3.5 space-y-2">
          {list.map(cat => {
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      placeholder="Название категории"
                      className="flex-1 px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="p-2 rounded-xl bg-emerald-500 text-white active:scale-90 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Color fast picker (with Drag-to-Scroll) */}
                  <div
                    ref={editColorBarRef}
                    onMouseDown={handleEditColorMouseDown}
                    onMouseMove={handleEditColorMouseMove}
                    onMouseUp={handleEditColorMouseUpOrLeave}
                    onMouseLeave={handleEditColorMouseUpOrLeave}
                    onWheel={handleWheelHorizontal}
                    className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 touch-pan-x cursor-grab active:cursor-grabbing select-none"
                  >
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          if (!hasMovedEditColor.current) {
                            setEditColor(c.class);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer shrink-0 transition-all ${c.class} ${
                          editColor === c.class ? 'ring-2 ring-slate-900 shadow-xs' : ''
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cat.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-90 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-90 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Category Box */}
          {isAddingNew ? (
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 space-y-2.5 mt-3">
              <h4 className="text-xs font-bold text-slate-800">Новая категория</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Название категории..."
                  className="flex-1 px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              {/* Color Presets (with Drag-to-Scroll) */}
              <div
                ref={newColorBarRef}
                onMouseDown={handleNewColorMouseDown}
                onMouseMove={handleNewColorMouseMove}
                onMouseUp={handleNewColorMouseUpOrLeave}
                onMouseLeave={handleNewColorMouseUpOrLeave}
                onWheel={handleWheelHorizontal}
                className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 touch-pan-x cursor-grab active:cursor-grabbing select-none"
              >
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      if (!hasMovedNewColor.current) {
                        setNewColor(c.class);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer shrink-0 transition-all ${c.class} ${
                      newColor === c.class ? 'ring-2 ring-slate-900 shadow-xs' : ''
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 active:scale-95 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleAddNew}
                  style={{ backgroundColor: theme.primary }}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Добавить
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer transition-colors mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить категорию</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleSaveAll}
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-300 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  );
};
