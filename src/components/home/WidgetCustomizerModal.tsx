import React, { useState, useEffect } from 'react';
import type { WidgetConfig, WidgetSize, WidgetType } from '../../types';
import { X, Check, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  widgetsConfig: WidgetConfig[];
  onSaveWidgets: (newConfig: WidgetConfig[]) => void;
  onClose: () => void;
}

export const defaultWidgetsConfig: WidgetConfig[] = [
  { id: 'cycle', type: 'cycle', title: '🌸 Мой Цикл', enabled: true, size: 'large', order: 0, row: 0, col: 0 },
  { id: 'water', type: 'water', title: '💧 Водный Баланс', enabled: true, size: 'medium', order: 1, row: 1, col: 0 },
  { id: 'pills', type: 'pills', title: '💊 Лекарства и Витамины', enabled: true, size: 'medium', order: 2, row: 2, col: 0 },
  { id: 'tip', type: 'tip', title: '💡 Совет Дня', enabled: true, size: 'small', order: 3, row: 3, col: 0 }
];

export const WidgetCustomizerModal: React.FC<WidgetCustomizerModalProps> = ({
  isOpen,
  widgetsConfig,
  onSaveWidgets,
  onClose
}) => {
  const [localConfig, setLocalConfig] = useState<WidgetConfig[]>([]);

  useEffect(() => {
    if (widgetsConfig && widgetsConfig.length > 0) {
      const sorted = [...widgetsConfig].sort((a, b) => a.order - b.order);
      setLocalConfig(sorted);
    } else {
      setLocalConfig(defaultWidgetsConfig);
    }
  }, [widgetsConfig, isOpen]);

  if (!isOpen) return null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= localConfig.length) return;

    const updated = [...localConfig];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const reordered = updated.map((item, idx) => ({ ...item, order: idx }));
    setLocalConfig(reordered);
  };

  const handleToggleEnabled = (id: string) => {
    setLocalConfig(prev =>
      prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleSetSize = (id: string, size: WidgetSize) => {
    setLocalConfig(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    );
  };

  const handleReset = () => {
    setLocalConfig(defaultWidgetsConfig);
  };

  const handleSave = () => {
    onSaveWidgets(localConfig);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClose();
  };

  const getWidgetEmoji = (type: WidgetType) => {
    switch (type) {
      case 'cycle': return '🌸';
      case 'water': return '💧';
      case 'pills': return '💊';
      case 'tip': return '💡';
      case 'divider': return '➖';
      case 'photo': return '🖼️';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-rose-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Настройка виджетов</h3>
              <p className="text-xs text-rose-500 font-semibold">Порядок, размеры и видимость</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widgets List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3">
          <p className="text-[11px] text-slate-500">
            Используйте стрелочки для изменения порядка и выбирайте их размер на экране:
          </p>

          {localConfig.map((widget, idx) => (
            <div
              key={widget.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                widget.enabled
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getWidgetEmoji(widget.type)}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{widget.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {widget.enabled ? `Размер: ${widget.size === 'small' ? 'Маленький' : widget.size === 'medium' ? 'Средний' : 'Большой'}` : 'Скрыт'}
                    </p>
                  </div>
                </div>

                {/* Move & Toggle Actions */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className={`p-1.5 rounded-xl border ${
                      idx === 0
                        ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'text-slate-600 bg-white border-slate-200 active:scale-90 cursor-pointer'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    disabled={idx === localConfig.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className={`p-1.5 rounded-xl border ${
                      idx === localConfig.length - 1
                        ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'text-slate-600 bg-white border-slate-200 active:scale-90 cursor-pointer'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleEnabled(widget.id)}
                    className={`p-1.5 rounded-xl border ml-1 active:scale-90 cursor-pointer ${
                      widget.enabled
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-slate-200 border-slate-300 text-slate-400'
                    }`}
                  >
                    {widget.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Size Selectors */}
              {widget.enabled && widget.type !== 'divider' && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Размер:</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    {(['small', 'medium', 'large'] as WidgetSize[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSetSize(widget.id, s)}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          widget.size === s
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s === 'small' && 'Маленький (S)'}
                        {s === 'medium' && 'Средний (M)'}
                        {s === 'large' && 'Большой (L)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Применить виджеты ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
