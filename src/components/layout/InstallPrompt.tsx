import React from 'react';
import { X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { MyPlaceLogo } from '../common/MyPlaceLogo';

interface InstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto no-scrollbar cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
              <MyPlaceLogo className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Установка приложения</h3>
              <p className="text-xs text-slate-400">Быстрый запуск с рабочего стола</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 active:scale-90 transition-transform cursor-pointer hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-[#203A5F] shrink-0" />
            <span>Работает на весь экран без адресной строки</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-[#203A5F] shrink-0" />
            <span>Работает офлайн без интернета</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-[#203A5F] shrink-0" />
            <span>Мгновенный доступ в 1 касание</span>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Всего 2 простых шага в браузере:
          </h4>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#203A5F]/10 text-[#203A5F] flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Нажмите кнопку <Share className="w-4 h-4 text-[#203A5F]" /> «Поделиться»
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Она находится в меню браузера (квадрат со стрелочкой или 3 точки).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#203A5F]/10 text-[#203A5F] flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Выберите <PlusSquare className="w-4 h-4 text-[#203A5F]" /> «На экран "Домой"»
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Нажмите «На экран "Домой"» и подтвердите «Добавить».
              </p>
            </div>
          </div>
        </div>

        {/* Action button without emoji */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#203A5F] hover:bg-[#1a2f4d] text-white font-bold text-sm shadow-md shadow-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
