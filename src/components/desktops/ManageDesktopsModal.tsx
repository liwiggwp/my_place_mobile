import React, { useState } from 'react';
import type { DashboardDesktop, WidgetConfig } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  Briefcase,
  Heart,
  Clock,
  Coffee,
  Sparkles,
  BookOpen,
  Smile,
  Shield,
  Zap,
  Star,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-react';

interface ManageDesktopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customDesktops: DashboardDesktop[];
  activeDesktopId?: string;
  onSelectDesktop: (id: string) => void;
  onCreateDesktop: (desktop: DashboardDesktop) => void;
  onUpdateDesktop: (desktop: DashboardDesktop) => void;
  onDeleteDesktop: (id: string) => void;
}

export const DESKTOP_ICON_LIST = [
  { id: 'briefcase', label: 'Работа', icon: Briefcase },
  { id: 'heart', label: 'Здоровье', icon: Heart },
  { id: 'clock', label: 'Фокус', icon: Clock },
  { id: 'coffee', label: 'Отдых', icon: Coffee },
  { id: 'sparkles', label: 'Учеба', icon: Sparkles },
  { id: 'book', label: 'Чтение', icon: BookOpen },
  { id: 'smile', label: 'Личное', icon: Smile },
  { id: 'shield', label: 'Привычки', icon: Shield },
  { id: 'zap', label: 'Энергия', icon: Zap },
  { id: 'star', label: 'Главное', icon: Star },
  { id: 'sun', label: 'Утро', icon: Sun },
  { id: 'moon', label: 'Вечер', icon: Moon },
  { id: 'grid', label: 'Универсал', icon: LayoutGrid }
];

export const renderDesktopIcon = (iconId?: string, className: string = 'w-4 h-4') => {
  const item = DESKTOP_ICON_LIST.find(i => i.id === iconId) || DESKTOP_ICON_LIST[0];
  const IconComponent = item.icon;
  return <IconComponent className={className} />;
};

export const ManageDesktopsModal: React.FC<ManageDesktopsModalProps> = ({
  isOpen,
  onClose,
  customDesktops,
  activeDesktopId,
  onSelectDesktop,
  onCreateDesktop,
  onUpdateDesktop,
  onDeleteDesktop
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newDesktopName, setNewDesktopName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('briefcase');
  const [editingDesktopId, setEditingDesktopId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIconId, setEditIconId] = useState('briefcase');

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDesktopName.trim()) return;

    const newDesktop: DashboardDesktop = {
      id: `desktop-${Date.now()}`,
      name: newDesktopName.trim(),
      icon: selectedIconId,
      widgets: []
    };

    onCreateDesktop(newDesktop);
    setNewDesktopName('');
    setIsCreating(false);
  };

  const handleCreateTemplate = (templateType: 'work' | 'health' | 'focus' | 'blank') => {
    let name = 'Мой стол';
    let icon = 'grid';
    let widgets: WidgetConfig[] = [];

    if (templateType === 'work') {
      name = 'Рабочий стол';
      icon = 'briefcase';
      widgets = [
        { id: `clock-${Date.now()}`, type: 'clock', title: 'Часы и Время', enabled: true, size: 'small', order: 0, row: 0, col: 0 },
        { id: `tasks-${Date.now()}`, type: 'tasks', title: 'Рабочие задачи', enabled: true, size: 'medium', order: 1, row: 1, col: 0, taskCategoryFilter: 'work' }
      ];
    } else if (templateType === 'health') {
      name = 'Здоровье и Баланс';
      icon = 'heart';
      widgets = [
        { id: `pills-${Date.now()}`, type: 'pills', title: 'Лекарства и Витамины', enabled: true, size: 'medium', order: 0, row: 0, col: 0 },
        { id: `water-${Date.now()}`, type: 'water', title: 'Водный Баланс', enabled: true, size: 'small', order: 1, row: 1, col: 0 },
        { id: `cycle-${Date.now()}`, type: 'cycle', title: 'Мой Цикл', enabled: true, size: 'small', order: 2, row: 1, col: 1 }
      ];
    } else if (templateType === 'focus') {
      name = 'Фокус и Время';
      icon = 'clock';
      widgets = [
        { id: `clock-${Date.now()}`, type: 'clock', title: 'Часы и Время', enabled: true, size: 'large', order: 0, row: 0, col: 0 },
        { id: `tip-${Date.now()}`, type: 'tip', title: 'Совет Дня', enabled: true, size: 'small', order: 1, row: 1, col: 0 }
      ];
    } else {
      name = 'Новый рабочий стол';
      icon = 'grid';
      widgets = [];
    }

    const newDesktop: DashboardDesktop = {
      id: `desktop-${Date.now()}`,
      name,
      icon,
      widgets
    };

    onCreateDesktop(newDesktop);
  };

  const handleStartEdit = (desktop: DashboardDesktop) => {
    setEditingDesktopId(desktop.id);
    setEditName(desktop.name);
    setEditIconId(desktop.icon || 'briefcase');
  };

  const handleSaveEdit = () => {
    if (!editingDesktopId || !editName.trim()) return;
    const desktop = customDesktops.find(d => d.id === editingDesktopId);
    if (!desktop) return;

    onUpdateDesktop({
      ...desktop,
      name: editName.trim(),
      icon: editIconId
    });

    setEditingDesktopId(null);
  };

  const handleDuplicate = (desktop: DashboardDesktop) => {
    const duplicated: DashboardDesktop = {
      id: `desktop-${Date.now()}`,
      name: `${desktop.name} (копия)`,
      icon: desktop.icon,
      widgets: desktop.widgets.map((w, idx) => ({
        ...w,
        id: `${w.type}-${Date.now()}-${idx}`
      }))
    };
    onCreateDesktop(duplicated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#203A5F]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Рабочие столы</h3>
              <p className="text-xs text-slate-500">Управляйте пространствами под задачи</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Create Templates */}
          {!isCreating && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Быстрые шаблоны столов
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCreateTemplate('work')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>«Работа»</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Часы + Задачи по работе</p>
                </button>

                <button
                  onClick={() => handleCreateTemplate('health')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>«Здоровье»</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Таблетки, вода, цикл</p>
                </button>

                <button
                  onClick={() => handleCreateTemplate('focus')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>«Фокус и Время»</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Крупные смарт-часы</p>
                </button>

                <button
                  onClick={() => setIsCreating(true)}
                  className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/70 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Свой стол</span>
                  </div>
                  <p className="text-[10px] text-indigo-500/80 mt-1">Настроить с нуля</p>
                </button>
              </div>
            </div>
          )}

          {/* New Custom Desktop Creation Form */}
          {isCreating && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Создание нового стола</span>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Отмена
                </button>
              </div>

              <input
                type="text"
                placeholder="Название стола (напр. 'Работа', 'Учёба')"
                value={newDesktopName}
                onChange={e => setNewDesktopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
                autoFocus
              />

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Иконка стола
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DESKTOP_ICON_LIST.map(item => {
                    const Icon = item.icon;
                    const isSelected = selectedIconId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIconId(item.id)}
                        className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#203A5F] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!newDesktopName.trim()}
                className="w-full py-2.5 rounded-xl bg-[#203A5F] text-white font-bold text-xs hover:bg-[#1a2f4d] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Создать рабочий стол</span>
              </button>
            </div>
          )}

          {/* List of Existing Desktops */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ваши рабочие столы ({customDesktops.length})
            </span>

            {customDesktops.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                У вас пока нет созданных столов. Выберите шаблон выше или создайте свой.
              </div>
            ) : (
              <div className="space-y-2">
                {customDesktops.map(desk => {
                  const isCurrent = desk.id === activeDesktopId;
                  const isEditingThis = editingDesktopId === desk.id;

                  if (isEditingThis) {
                    return (
                      <div
                        key={desk.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 space-y-2.5 animate-fade-in"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
                        />
                        <div className="grid grid-cols-7 gap-1">
                          {DESKTOP_ICON_LIST.map(item => {
                            const Icon = item.icon;
                            const isSelected = editIconId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setEditIconId(item.id)}
                                className={`h-7 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#203A5F] text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingDesktopId(null)}
                            className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-200"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 rounded-lg bg-[#203A5F] text-white text-xs font-bold hover:bg-[#1a2f4d]"
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={desk.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-slate-50 border-[#203A5F]/40 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectDesktop(desk.id);
                          onClose();
                        }}
                        className="flex items-center gap-2.5 min-w-0 text-left flex-1"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#203A5F] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {renderDesktopIcon(desk.icon, 'w-4 h-4')}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {desk.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {desk.widgets.length} виджетов
                          </span>
                        </div>
                      </button>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(desk)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(desk)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                          title="Дублировать"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Удалить рабочий стол «${desk.name}»?`)) {
                              onDeleteDesktop(desk.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новый стол</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#203A5F] hover:bg-[#1a2f4d] text-white font-bold text-xs transition-colors shadow-xs"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
