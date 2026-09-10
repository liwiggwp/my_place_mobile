import React, { useState } from 'react';
import type { NotionPage, NotionDatabase, WorkspaceTemplate } from '../../types/notion';
import {
  Plus,
  Sparkles,
  Search,
  Pin,
  Trash2,
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import { TemplatesGalleryModal } from './TemplatesGalleryModal';

interface WorkspaceViewProps {
  pages: NotionPage[];
  databases: NotionDatabase[];
  onOpenPage: (page: NotionPage) => void;
  onOpenBuiltinHub: (hubType: string) => void;
  onAddCustomPage: (title?: string, icon?: string) => void;
  onAddCustomDatabase: (name?: string, icon?: string) => void;
  onApplyTemplate: (template: WorkspaceTemplate) => void;
  onDeletePage: (id: string) => void;
  onTogglePinPage: (id: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  pages,
  onOpenPage,
  onOpenBuiltinHub,
  onAddCustomPage,
  onAddCustomDatabase,
  onApplyTemplate,
  onDeletePage,
  onTogglePinPage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Filter pages by search
  const filteredPages = pages.filter(p => {
    if (!searchQuery.trim()) return true;
    return p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pinnedPages = filteredPages.filter(p => p.isPinned);
  const builtinPages = filteredPages.filter(p => p.type === 'builtin_hub');
  const customPages = filteredPages.filter(p => p.type !== 'builtin_hub');

  const getHubSubtitle = (hubType?: string) => {
    switch (hubType) {
      case 'finance':
        return 'Счета, копилки, кредиты, баланс';
      case 'tasks':
        return 'Планер, дедлайны, подзадачи';
      case 'desktops':
        return 'Экраны виджетов iOS 18 и Standby';
      case 'water':
        return 'Дневная норма и лог напитков';
      case 'pills':
        return 'Курсы препаратов и напоминания';
      case 'cycle':
        return 'Фазы, симптомы и прогнозы';
      default:
        return 'Встроенный модуль';
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in text-slate-800">
      
      {/* 1. HERO & ACTION BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Рабочее пространство
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Мое Пространство
            </h2>
          </div>

          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Шаблоны</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по страницам и базам..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onAddCustomPage()}
            className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Страница</span>
          </button>

          <button
            type="button"
            onClick={() => onAddCustomDatabase()}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>+ База данных</span>
          </button>
        </div>
      </div>

      {/* 2. PINNED SECTION (If any) */}
      {pinnedPages.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 px-2">
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Закрепленные
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {pinnedPages.map(page => (
              <div
                key={page.id}
                onClick={() => {
                  if (page.type === 'builtin_hub' && page.builtinHubType) {
                    onOpenBuiltinHub(page.builtinHubType);
                  } else {
                    onOpenPage(page);
                  }
                }}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs space-y-2 cursor-pointer transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{page.icon}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onTogglePinPage(page.id);
                    }}
                    className="p-1 text-amber-500 hover:text-slate-400 transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5 fill-amber-500" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 truncate">{page.title}</h4>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {page.type === 'builtin_hub' ? 'Хаб' : page.type === 'custom_database' ? 'База' : 'Страница'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BUILTIN HUBS (TEMPLATES) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Встроенные хабы & модули
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {builtinPages.length} хабов
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {builtinPages.map(page => {
            return (
              <div
                key={page.id}
                onClick={() => {
                  if (page.builtinHubType) {
                    onOpenBuiltinHub(page.builtinHubType);
                  }
                }}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-99 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    {page.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {page.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {getHubSubtitle(page.builtinHubType)}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CUSTOM PAGES & DATABASES */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Мои страницы и базы
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {customPages.length} создано
          </span>
        </div>

        {customPages.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/90 space-y-2">
            <span className="text-3xl">✨</span>
            <p className="text-xs font-bold text-slate-700">У вас пока нет своих страниц</p>
            <p className="text-[11px] text-slate-400">
              Создайте новую пустую страницу или выберите готовый шаблон в галерее
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onAddCustomPage()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                + Создать страницу
              </button>
              <button
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold cursor-pointer"
              >
                Выбрать шаблон
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customPages.map(page => (
              <div
                key={page.id}
                onClick={() => onOpenPage(page)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-99 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {page.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {page.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {page.type === 'custom_database' ? '📊 База данных' : '📝 Блочная страница'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onTogglePinPage(page.id);
                    }}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      page.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-600'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`Удалить страницу "${page.title}"?`)) {
                        onDeletePage(page.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Modal */}
      <TemplatesGalleryModal
        isOpen={isTemplatesModalOpen}
        onApplyTemplate={onApplyTemplate}
        onClose={() => setIsTemplatesModalOpen(false)}
      />

    </div>
  );
};
