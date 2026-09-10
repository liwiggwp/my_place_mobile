import React, { useState } from 'react';
import type { WorkspaceTemplate } from '../../types/notion';
import { WORKSPACE_TEMPLATES_GALLERY } from '../../utils/notionTemplates';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface TemplatesGalleryModalProps {
  isOpen: boolean;
  onApplyTemplate: (template: WorkspaceTemplate) => void;
  onClose: () => void;
}

export const TemplatesGalleryModal: React.FC<TemplatesGalleryModalProps> = ({
  isOpen,
  onApplyTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'builtin', label: 'Встроенные хабы' },
    { id: 'productivity', label: 'Продуктивность' },
    { id: 'lifestyle', label: 'Лайфстайл' },
    { id: 'study', label: 'Учеба' },
    { id: 'finance', label: 'Финансы' },
    { id: 'health', label: 'Здоровье' }
  ];

  const filtered = WORKSPACE_TEMPLATES_GALLERY.filter(t => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'builtin') return t.pageType === 'builtin_hub';
    return t.category === selectedCategory;
  });

  const handleApply = (tmpl: WorkspaceTemplate) => {
    onApplyTemplate(tmpl);
    setAppliedId(tmpl.id);
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Галерея шаблонов</h3>
              <p className="text-xs text-slate-500 font-semibold">Выберите готовый шаблон для вашего пространства</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-white">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(tmpl => {
            const isApplied = appliedId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs space-y-3 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{tmpl.icon}</span>
                    {tmpl.badge && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{tmpl.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(tmpl)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800'
                  }`}
                >
                  {isApplied ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isApplied ? 'Добавлено!' : 'Вставить шаблон'}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
