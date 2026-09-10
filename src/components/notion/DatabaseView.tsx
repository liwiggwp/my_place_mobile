import React, { useState } from 'react';
import type { NotionDatabase, NotionItem, NotionProperty, DatabaseViewType } from '../../types/notion';
import {
  Calendar,
  Columns3,
  List,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { CalendarView } from './CalendarView';
import { DatabaseItemModal } from './DatabaseItemModal';
import { PropertyManagerModal } from './PropertyManagerModal';

interface DatabaseViewProps {
  database: NotionDatabase;
  onUpdateDatabase: (updated: NotionDatabase) => void;
  onBack?: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  database,
  onUpdateDatabase
}) => {
  const [activeView, setActiveView] = useState<DatabaseViewType>(database.defaultView || 'board');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [editingItem, setEditingItem] = useState<NotionItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPropsModalOpen, setIsPropsModalOpen] = useState(false);
  const [defaultItemDate, setDefaultItemDate] = useState<string | undefined>(undefined);
  const [defaultItemStatus, setDefaultItemStatus] = useState<string | undefined>(undefined);

  // Group by property (typically first select property)
  const selectProp = database.properties.find(p => p.type === 'select');
  const groupByPropId = database.groupByPropertyId || selectProp?.id;

  // Filter items by search
  const filteredItems = database.items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchProps = Object.values(item.properties).some(v =>
      String(v || '').toLowerCase().includes(q)
    );
    return matchTitle || matchProps;
  });

  // Handlers for Items
  const handleSaveItem = (savedItem: NotionItem) => {
    const exists = database.items.some(i => i.id === savedItem.id);
    const updatedItems = exists
      ? database.items.map(i => (i.id === savedItem.id ? savedItem : i))
      : [savedItem, ...database.items];

    onUpdateDatabase({
      ...database,
      items: updatedItems
    });
  };

  const handleDeleteItem = (id: string) => {
    onUpdateDatabase({
      ...database,
      items: database.items.filter(i => i.id !== id)
    });
  };

  const handleUpdateProperties = (newProps: NotionProperty[]) => {
    onUpdateDatabase({
      ...database,
      properties: newProps
    });
  };

  const handleOpenAdd = (dateStr?: string, statusId?: string) => {
    setDefaultItemDate(dateStr);
    setDefaultItemStatus(statusId);
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: NotionItem) => {
    setDefaultItemDate(undefined);
    setDefaultItemStatus(undefined);
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-16 animate-fade-in text-slate-800">
      
      {/* Database Title & Top Actions */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0">{database.icon || '📊'}</span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 truncate">{database.name}</h2>
              {database.description && (
                <p className="text-[11px] text-slate-400 font-medium truncate">{database.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsPropsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Настройка свойств"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Свойства</span>
            </button>

            <button
              onClick={() => handleOpenAdd()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Запись</span>
            </button>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 overflow-x-auto pb-0.5">
          <div className="flex items-center gap-1">
            {[
              { id: 'board' as DatabaseViewType, label: 'Канбан', icon: Columns3 },
              { id: 'calendar' as DatabaseViewType, label: 'Календарь', icon: Calendar },
              { id: 'list' as DatabaseViewType, label: 'Список', icon: List },
              { id: 'gallery' as DatabaseViewType, label: 'Галерея', icon: LayoutGrid },
              { id: 'table' as DatabaseViewType, label: 'Таблица', icon: TableIcon }
            ].map(v => {
              const Icon = v.icon;
              const isActive = activeView === v.id;

              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0 w-32 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CALENDAR VIEW                                          */}
      {/* ========================================================= */}
      {activeView === 'calendar' && (
        <CalendarView
          database={{ ...database, items: filteredItems }}
          onSelectItem={handleEditItem}
          onAddItemOnDate={dateStr => handleOpenAdd(dateStr)}
        />
      )}

      {/* ========================================================= */}
      {/* 2. KANBAN BOARD VIEW                                      */}
      {/* ========================================================= */}
      {activeView === 'board' && (
        <div className="space-y-3">
          {(() => {
            const prop = database.properties.find(p => p.id === groupByPropId);
            const options = prop?.options || [
              { id: 'opt-default', label: 'Все записи', color: 'bg-slate-100 text-slate-800' }
            ];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {options.map(opt => {
                  const columnItems = filteredItems.filter(item => {
                    if (!prop) return true;
                    return item.properties[prop.id] === opt.id;
                  });

                  return (
                    <div
                      key={opt.id}
                      className="p-3.5 rounded-3xl bg-slate-100/70 border border-slate-200/80 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${opt.color}`}>
                            {opt.label} ({columnItems.length})
                          </span>

                          <button
                            onClick={() => handleOpenAdd(undefined, opt.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Добавить в эту колонку"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Cards in column */}
                        <div className="space-y-2">
                          {columnItems.map(item => {
                            const dateProp = database.properties.find(p => p.type === 'date');
                            const dateVal = dateProp ? item.properties[dateProp.id] : undefined;
                            const ratingProp = database.properties.find(p => p.type === 'rating');
                            const ratingVal = ratingProp ? item.properties[ratingProp.id] : undefined;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleEditItem(item)}
                                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs space-y-2 cursor-pointer transition-all active:scale-98"
                              >
                                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>

                                {(dateVal || ratingVal > 0) && (
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                                    {dateVal && <span>📅 {dateVal}</span>}
                                    {ratingVal > 0 && (
                                      <span className="text-amber-500 font-bold">
                                        ★ {ratingVal}/5
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {columnItems.length === 0 && (
                            <div className="py-6 text-center text-slate-400 text-xs">
                              Пусто
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAdd(undefined, opt.id)}
                        className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить карточку</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LIST VIEW                                              */}
      {/* ========================================================= */}
      {activeView === 'list' && (
        <div className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Записей пока нет
            </div>
          ) : (
            filteredItems.map(item => {
              const selectOpt = selectProp
                ? (selectProp.options || []).find(o => o.id === item.properties[selectProp.id])
                : null;
              const dateProp = database.properties.find(p => p.type === 'date');
              const dateVal = dateProp ? item.properties[dateProp.id] : undefined;

              return (
                <div
                  key={item.id}
                  onClick={() => handleEditItem(item)}
                  className="p-3 hover:bg-slate-50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectOpt && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectOpt.color}`}>
                        {selectOpt.label}
                      </span>
                    )}
                    {dateVal && (
                      <span className="text-[10px] text-slate-400 font-semibold">{dateVal}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GALLERY VIEW                                           */}
      {/* ========================================================= */}
      {activeView === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const selectOpt = selectProp
              ? (selectProp.options || []).find(o => o.id === item.properties[selectProp.id])
              : null;
            const ratingProp = database.properties.find(p => p.type === 'rating');
            const ratingVal = ratingProp ? item.properties[ratingProp.id] : undefined;

            return (
              <div
                key={item.id}
                onClick={() => handleEditItem(item)}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs space-y-3 cursor-pointer transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  {selectOpt && (
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold inline-block ${selectOpt.color}`}>
                      {selectOpt.label}
                    </span>
                  )}
                  <h4 className="text-xs font-black text-slate-900 line-clamp-2">{item.title}</h4>
                </div>

                {ratingVal > 0 && (
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★'.repeat(ratingVal)}{'☆'.repeat(5 - ratingVal)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TABLE VIEW                                             */}
      {/* ========================================================= */}
      {activeView === 'table' && (
        <div className="p-3 rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-3">Название</th>
                {database.properties.map(p => (
                  <th key={p.id} className="py-2 px-3">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => handleEditItem(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.title}</td>
                  {database.properties.map(p => {
                    const val = item.properties[p.id];
                    if (p.type === 'select') {
                      const opt = (p.options || []).find(o => o.id === val);
                      return (
                        <td key={p.id} className="py-2.5 px-3">
                          {opt ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${opt.color}`}>
                              {opt.label}
                            </span>
                          ) : '-'}
                        </td>
                      );
                    }
                    if (p.type === 'rating') {
                      return (
                        <td key={p.id} className="py-2.5 px-3 text-amber-500 font-bold">
                          {val ? `★ ${val}/5` : '-'}
                        </td>
                      );
                    }
                    return (
                      <td key={p.id} className="py-2.5 px-3 text-slate-500">{val || '-'}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <DatabaseItemModal
        isOpen={isItemModalOpen}
        item={editingItem}
        properties={database.properties}
        defaultDate={defaultItemDate}
        defaultStatusId={defaultItemStatus}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        onClose={() => setIsItemModalOpen(false)}
      />

      <PropertyManagerModal
        isOpen={isPropsModalOpen}
        properties={database.properties}
        onSaveProperties={handleUpdateProperties}
        onClose={() => setIsPropsModalOpen(false)}
      />

    </div>
  );
};
