import React, { useState, useRef, useEffect } from 'react';
import type { AppData, CyclePrediction, Pill, WidgetConfig, WidgetSize, WidgetType } from '../../types';
import { getTodayString, getMonthMatrix, parseDateString } from '../../utils/dateUtils';
import { getDateStatus } from '../../utils/cycleCalculations';
import { getScreenTheme } from '../../utils/themeUtils';
import {
  Droplets,
  Pill as PillIcon,
  ChevronRight,
  Plus,
  Check,
  Calendar,
  Flame,
  Minus,
  Maximize2,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Leaf,
  Moon,
  Lightbulb
} from 'lucide-react';
import { AddWidgetModal } from './AddWidgetModal';
import { MyPlaceLogo } from '../common/MyPlaceLogo';

interface HomeDashboardProps {
  appData: AppData;
  prediction: CyclePrediction;
  onNavigate: (tab: 'cycle' | 'pills' | 'water' | 'tasks' | 'settings') => void;
  onQuickAddWater: (amount: number) => void;
  onLogPillTaken?: (pillId: string, scheduledTime: string) => void;
  onOpenProfile: () => void;
  onUpdateWidgets: (newConfig: WidgetConfig[]) => void;
}

export const defaultWidgetsConfig: WidgetConfig[] = [
  { id: 'cycle', type: 'cycle', title: 'Мой Цикл', enabled: true, size: 'large', order: 0, row: 0, col: 0 },
  { id: 'tasks', type: 'tasks', title: 'Задачи и Планы', enabled: true, size: 'medium', order: 1, row: 1, col: 0 },
  { id: 'water', type: 'water', title: 'Водный Баланс', enabled: true, size: 'medium', order: 2, row: 2, col: 0 },
  { id: 'pills', type: 'pills', title: 'Лекарства и Витамины', enabled: true, size: 'medium', order: 3, row: 3, col: 0 },
  { id: 'tip', type: 'tip', title: 'Совет Дня', enabled: true, size: 'small', order: 4, row: 4, col: 0 }
];

interface DragSession {
  widgetId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
  hoverSlot: { row: number; col: 0 | 1 } | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  appData,
  prediction,
  onNavigate,
  onQuickAddWater,
  onLogPillTaken,
  onOpenProfile,
  onUpdateWidgets
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetSlotForAdd, setTargetSlotForAdd] = useState<{ row: number; col: 0 | 1 } | null>(null);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [activePhotoUploadWidgetId, setActivePhotoUploadWidgetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayStr = getTodayString();
  const todayDate = parseDateString(todayStr);

  // Themes
  const globalTheme = getScreenTheme(appData.themeSettings, 'global');
  const cycleTheme = getScreenTheme(appData.themeSettings, 'cycle');
  const tasksTheme = getScreenTheme(appData.themeSettings, 'tasks');
  const waterTheme = getScreenTheme(appData.themeSettings, 'water');
  const pillsTheme = getScreenTheme(appData.themeSettings, 'pills');

  const profile = appData.userProfile || {
    name: 'Мой профиль',
    avatarEmoji: '🌸',
    goal: 'track_cycle'
  };

  // Normalize widgets and make sure coordinates are strictly defined and non-colliding
  const rawWidgets: WidgetConfig[] = (appData.widgetsConfig && appData.widgetsConfig.length > 0
    ? appData.widgetsConfig
    : defaultWidgetsConfig
  ).map((w, idx) => ({
    ...w,
    row: typeof w.row === 'number' ? w.row : idx,
    col: (w.col === 1 ? 1 : 0) as 0 | 1
  }));

  const activeWidgets = rawWidgets.filter(w => w.enabled);

  // Keep ref in sync
  useEffect(() => {
    dragSessionRef.current = dragSession;
  }, [dragSession]);

  // Global window listener for calm, smooth iOS 18 Drag & Drop
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!isEditing || !session) return;

      const deltaX = e.clientX - session.startX;
      const deltaY = e.clientY - session.startY;
      const dist = Math.hypot(deltaX, deltaY);

      const hasMoved = session.hasMoved || dist > 6;

      // Find hovered slot
      const elemUnder = document.elementFromPoint(e.clientX, e.clientY);
      const slotElem = elemUnder?.closest('[data-grid-slot]');
      let hoverSlot: { row: number; col: 0 | 1 } | null = session.hoverSlot;

      if (slotElem) {
        const row = Number(slotElem.getAttribute('data-grid-row'));
        const col = Number(slotElem.getAttribute('data-grid-col')) as 0 | 1;
        if (!isNaN(row) && (col === 0 || col === 1)) {
          hoverSlot = { row, col };
        }
      }

      setDragSession({
        ...session,
        currentX: e.clientX,
        currentY: e.clientY,
        hasMoved,
        hoverSlot
      });
    };

    const onWindowPointerUp = () => {
      const session = dragSessionRef.current;
      if (session && session.hasMoved && session.hoverSlot) {
        const { widgetId, hoverSlot } = session;
        const draggedWidget = rawWidgets.find(w => w.id === widgetId);

        if (draggedWidget) {
          const targetWidget = activeWidgets.find(
            w => w.row === hoverSlot.row && (w.size === 'small' && draggedWidget.size === 'small' ? w.col === hoverSlot.col : true)
          );

          let updated: WidgetConfig[];

          if (targetWidget && targetWidget.id !== widgetId) {
            // Clean swap of coordinates
            updated = rawWidgets.map(w => {
              if (w.id === widgetId) {
                return { ...w, row: hoverSlot.row, col: hoverSlot.col };
              }
              if (w.id === targetWidget.id) {
                return { ...w, row: draggedWidget.row, col: draggedWidget.col };
              }
              return w;
            });
          } else {
            // Drop in empty slot (supports placing anywhere and skipping rows freely)
            updated = rawWidgets.map(w => {
              if (w.id === widgetId) {
                return { ...w, row: hoverSlot.row, col: hoverSlot.col };
              }
              return w;
            });
          }

          onUpdateWidgets(updated);
          if (navigator.vibrate) navigator.vibrate(25);
        }
      }

      setDragSession(null);
      dragSessionRef.current = null;
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [isEditing, rawWidgets, activeWidgets]);

  // Pointer Down on card
  const handleCardPointerDown = (e: React.PointerEvent, widgetId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (!isEditing) {
      longPressTimer.current = window.setTimeout(() => {
        setIsEditing(true);
        if (navigator.vibrate) navigator.vibrate(40);
      }, 450);
      return;
    }

    const draggedWidget = rawWidgets.find(w => w.id === widgetId);
    setDragSession({
      widgetId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      hasMoved: false,
      hoverSlot: draggedWidget ? { row: draggedWidget.row, col: draggedWidget.col } : null
    });
  };

  const handleCardPointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Safe Size Cycle with Automatic Collision Prevention
  const handleCycleSize = (id: string) => {
    const target = rawWidgets.find(w => w.id === id);
    if (!target) return;

    let nextSize: WidgetSize;
    if (target.type === 'photo') {
      nextSize = target.size === 'small' ? 'large' : 'small';
    } else {
      nextSize = target.size === 'small' ? 'medium' : target.size === 'medium' ? 'large' : 'small';
    }

    let updatedList = rawWidgets.map(w => {
      if (w.id === id) {
        return { ...w, size: nextSize, col: (nextSize === 'small' ? target.col : 0) as 0 | 1 };
      }
      return w;
    });

    if (nextSize !== 'small') {
      const otherInSameRow = activeWidgets.find(w => w.id !== id && w.row === target.row);

      if (otherInSameRow) {
        updatedList = updatedList.map(w => {
          if (w.id === id) {
            return { ...w, row: target.row, col: 0 };
          }
          if (w.id === otherInSameRow.id) {
            return { ...w, row: target.row + 1, col: 0 };
          }
          if (w.row > target.row) {
            return { ...w, row: w.row + 1 };
          }
          return w;
        });
      }
    }

    onUpdateWidgets(updatedList);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // 100% Reliable Remove Widget
  const handleRemoveWidget = (id: string) => {
    if (id.startsWith('divider-') || id.startsWith('photo-')) {
      const updated = rawWidgets.filter(w => w.id !== id);
      onUpdateWidgets(updated);
    } else {
      const updated = rawWidgets.map(w => (w.id === id ? { ...w, enabled: false } : w));
      onUpdateWidgets(updated);
    }
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Add widget or divider/photo from gallery
  const handleAddWidgetFromGallery = (type: WidgetType, size: WidgetSize, dividerStyle?: 'blank' | 'line') => {
    let targetRow: number;
    let targetCol: 0 | 1 = 0;

    if (targetSlotForAdd) {
      targetRow = targetSlotForAdd.row;
      targetCol = targetSlotForAdd.col;
    } else {
      targetRow = activeWidgets.length > 0 ? Math.max(...activeWidgets.map(w => w.row)) + 1 : 0;
    }

    const isOccupiedRow = activeWidgets.some(w => w.row === targetRow);
    const needShift = (type === 'divider' || size !== 'small') && isOccupiedRow;

    let baseWidgets = rawWidgets;
    if (needShift) {
      baseWidgets = rawWidgets.map(w => (w.row >= targetRow ? { ...w, row: w.row + 1 } : w));
    }

    if (type === 'divider') {
      const newDivider: WidgetConfig = {
        id: `divider-${Date.now()}`,
        type: 'divider',
        title: 'Дивидер',
        enabled: true,
        size,
        order: baseWidgets.length,
        row: targetRow,
        col: 0,
        dividerStyle: dividerStyle || 'line'
      };
      onUpdateWidgets([...baseWidgets, newDivider]);
      setTargetSlotForAdd(null);
      return;
    }

    if (type === 'photo') {
      const effectiveSize = size === 'medium' ? 'large' : size;
      const newPhotoId = `photo-${Date.now()}`;
      const newPhotoWidget: WidgetConfig = {
        id: newPhotoId,
        type: 'photo',
        title: 'Моё фото',
        enabled: true,
        size: effectiveSize,
        order: baseWidgets.length,
        row: targetRow,
        col: targetCol
      };
      onUpdateWidgets([...baseWidgets, newPhotoWidget]);
      setTargetSlotForAdd(null);
      setTimeout(() => {
        setActivePhotoUploadWidgetId(newPhotoId);
        fileInputRef.current?.click();
      }, 100);
      return;
    }

    const exists = baseWidgets.some(w => w.type === type);
    let updated: WidgetConfig[];
    if (exists) {
      updated = baseWidgets.map(w =>
        w.type === type ? { ...w, enabled: true, size, row: targetRow, col: targetCol } : w
      );
    } else {
      const title =
        type === 'cycle' ? '🌸 Мой Цикл' :
        type === 'water' ? '💧 Водный Баланс' :
        type === 'pills' ? '💊 Лекарства и Витамины' : '💡 Совет Дня';
      updated = [
        ...baseWidgets,
        { id: type, type, title, enabled: true, size, order: baseWidgets.length, row: targetRow, col: targetCol }
      ];
    }
    onUpdateWidgets(updated);
    setTargetSlotForAdd(null);
  };

  // Image Upload and Canvas Compression Handler
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoUploadWidgetId) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const updated = rawWidgets.map(w =>
            w.id === activePhotoUploadWidgetId ? { ...w, imageUrl: compressedDataUrl } : w
          );
          onUpdateWidgets(updated);
          setActivePhotoUploadWidgetId(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUploadForWidget = (widgetId: string) => {
    setActivePhotoUploadWidgetId(widgetId);
    fileInputRef.current?.click();
  };

  // Water calculations
  const todayWaterLogs = appData.waterLogs.filter(w => w.date === todayStr);
  const currentWaterTotal = todayWaterLogs.reduce((acc, w) => acc + w.amount, 0);
  const waterGoal = appData.waterSettings.dailyGoal || 2000;
  const waterPercent = Math.min(100, Math.round((currentWaterTotal / waterGoal) * 100));

  // Pills calculations
  const activePills = appData.pills.filter(p => p.active);
  let totalDosesToday = 0;
  let takenDosesToday = 0;
  let nextPillInfo: { pill: Pill; time: string } | null = null;

  activePills.forEach(p => {
    p.times.forEach(t => {
      totalDosesToday++;
      const isTaken = appData.pillLogs.some(
        l => l.pillId === p.id && l.date === todayStr && l.scheduledTime === t && l.status === 'taken'
      );
      if (isTaken) {
        takenDosesToday++;
      } else if (!nextPillInfo) {
        nextPillInfo = { pill: p, time: t };
      }
    });
  });

  const getPhaseIcon = () => {
    switch (prediction.currentPhase) {
      case 'menstruation': return <Droplets className="w-4 h-4 text-rose-200 shrink-0" />;
      case 'ovulation': return <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />;
      case 'follicular': return <Leaf className="w-4 h-4 text-emerald-200 shrink-0" />;
      default: return <Moon className="w-4 h-4 text-indigo-200 shrink-0" />;
    }
  };

  // Mini calendar matrix for Large Cycle Widget
  const calendarMatrix = getMonthMatrix(todayDate.getFullYear(), todayDate.getMonth());
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  /* =======================================================
     CLEAN EDIT CONTROLS
     ======================================================= */
  const renderEditControls = (widget: WidgetConfig) => {
    if (!isEditing) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-30 flex items-start justify-between p-1.5 sm:p-2">
        {/* Red (-) Delete Button */}
        <button
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            handleRemoveWidget(widget.id);
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-transform pointer-events-auto shrink-0"
          title="Удалить с экрана"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Size Cycler Pill Badge */}
        {widget.type !== 'divider' && (
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              handleCycleSize(widget.id);
            }}
            style={{ backgroundColor: globalTheme.primary }}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full active:scale-90 backdrop-blur-md text-white font-black text-[9px] sm:text-[10px] flex items-center gap-1 shadow-md border border-white/40 cursor-pointer transition-transform pointer-events-auto shrink-0"
            title="Нажмите для смены размера"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>{widget.size.toUpperCase()}</span>
          </button>
        )}
      </div>
    );
  };

  /* =======================================================
     WIDGET RENDERERS
     ======================================================= */

  // 1. CYCLE WIDGET
  const renderCycleWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${cycleTheme.primary}60`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${cycleTheme.primary} 0%, ${cycleTheme.secondary} 100%)`,
      ...dragStyle
    };

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('cycle')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none min-w-0">
            <span className="text-xl shrink-0">{getPhaseIcon()}</span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md truncate max-w-[95px]">
              {prediction.phaseName}
            </span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{prediction.currentDayOfCycle} дн.</h3>
            <p className="text-[11px] text-white/80 font-medium">текущий цикл</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/90 pointer-events-none">
            <span className="truncate pr-1">{prediction.daysUntilNextPeriod > 0 ? `Через ${prediction.daysUntilNextPeriod} дн.` : 'Месячные'}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      );
    }

    if (size === 'medium') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('cycle')}
          style={cardGradientStyle}
          className={`relative p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-white border border-white/20">
                <span>{getPhaseIcon()}</span>
                <span>{prediction.phaseName}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-1.5">
                {prediction.currentDayOfCycle} день цикла
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20 text-xs pointer-events-none">
            <div className="flex items-center gap-1.5 text-white/90 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-200 shrink-0" />
              <span className="truncate">{prediction.daysUntilNextPeriod > 0 ? `Месячные через ${prediction.daysUntilNextPeriod} дн.` : 'Период месячных'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 justify-end truncate">
              <Flame className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="truncate">Зачатие: {prediction.pregnancyChance === 'high' ? 'Высокое' : 'Низкое'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Large Size with Embedded Month Calendar Matrix
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('cycle')}
        style={cardGradientStyle}
        className={`relative p-5 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}

        {/* Top Header of Large Widget */}
        <div className="flex items-start justify-between relative z-10 pointer-events-none">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-white border border-white/20">
              <span>{getPhaseIcon()}</span>
              <span>{monthNames[todayDate.getMonth()]} {todayDate.getFullYear()} • {prediction.phaseName}</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-1">
              {prediction.currentDayOfCycle} день цикла
            </h3>
          </div>

          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Embedded Interactive Month Calendar Grid */}
        <div className="mt-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 pointer-events-none">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/70 mb-1.5">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span className="text-slate-300">Сб</span>
            <span className="text-slate-300">Вс</span>
          </div>

          <div className="space-y-1">
            {calendarMatrix.slice(0, 5).map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1 text-center">
                {week.map(day => {
                  const status = getDateStatus(day.dateStr, appData.periods, appData.cycleSettings);
                  const isTodayDate = day.dateStr === todayStr;
                  const log = appData.dayLogs[day.dateStr];
                  const hasIntimacy = log?.intimacy?.hadSex || (log?.sexActivity && log?.sexActivity !== 'none');

                  let dayStyle = 'text-white/80 bg-white/5';
                  if (status.isPeriod) {
                    dayStyle = 'bg-rose-500 text-white font-bold shadow-xs';
                  } else if (status.isPredictedPeriod) {
                    dayStyle = 'bg-rose-400/40 text-rose-100 font-semibold border border-rose-300/50';
                  } else if (status.isOvulation) {
                    dayStyle = 'bg-purple-500 text-white font-bold shadow-xs';
                  } else if (status.isFertile) {
                    dayStyle = 'bg-emerald-500/60 text-white font-semibold';
                  }

                  if (!day.isCurrentMonth) {
                    dayStyle = 'text-white/20 bg-transparent';
                  }

                  return (
                    <div
                      key={day.dateStr}
                      className={`h-7 rounded-lg flex flex-col items-center justify-center relative text-[11px] ${dayStyle} ${
                        isTodayDate ? 'ring-2 ring-white font-black' : ''
                      }`}
                    >
                      <span className="leading-none">{day.dayNum}</span>
                      {hasIntimacy && (
                        <span className="text-[7px] leading-none absolute -bottom-0.5">●</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-around text-[9px] text-white/80 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Месячные</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Овуляция</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/80" /> Фертильность</span>
          </div>
        </div>

        {/* Bottom stats summary */}
        <div className="mt-3 flex items-center justify-between text-xs text-white/90 font-medium pointer-events-none">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-200 shrink-0" />
            <span className="truncate">{prediction.daysUntilNextPeriod > 0 ? `Месячные через ${prediction.daysUntilNextPeriod} дн.` : 'Период месячных'}</span>
          </div>
          <span className="font-bold underline text-white shrink-0 ml-2">Открыть дневник →</span>
        </div>
      </div>
    );
  };

  // 2. WATER WIDGET
  const renderWaterWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${waterTheme.primary}60`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${waterTheme.primary} 0%, ${waterTheme.secondary} 100%)`,
      ...dragStyle
    };

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('water')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <Droplets className="w-5 h-5 text-white/90 shrink-0" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">{waterPercent}%</span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{currentWaterTotal}</h3>
            <p className="text-[11px] text-white/80 font-medium">из {waterGoal} мл</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between">
            <button
              onClick={e => {
                e.stopPropagation();
                if (!isEditing) onQuickAddWater(250);
              }}
              style={{ color: waterTheme.primary }}
              className="px-2 py-1 rounded-xl bg-white font-bold text-[10px] flex items-center gap-0.5 active:scale-90 pointer-events-auto"
            >
              <Plus className="w-3 h-3" /> +250
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 pointer-events-none" />
          </div>
        </div>
      );
    }

    if (size === 'medium') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('water')}
          style={cardGradientStyle}
          className={`relative p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Водный баланс</span>
                <div className="text-xl font-black">{currentWaterTotal} <span className="text-xs font-semibold text-white/70">/ {waterGoal} мл</span></div>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
              {waterPercent}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden pointer-events-none">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
            <button
              onClick={e => {
                e.stopPropagation();
                if (!isEditing) onQuickAddWater(250);
              }}
              style={{ color: waterTheme.primary }}
              className="px-3 py-1 rounded-xl bg-white font-bold text-xs flex items-center gap-1 active:scale-90 shadow-xs pointer-events-auto"
            >
              <Plus className="w-3.5 h-3.5" /> <span>+250 мл</span>
            </button>
            <span className="text-[11px] text-white/80 flex items-center gap-0.5 font-medium pointer-events-none">
              Подробнее <ChevronRight className="w-4 h-4 text-white/80" />
            </span>
          </div>
        </div>
      );
    }

    // Large
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('water')}
        style={cardGradientStyle}
        className={`relative p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">Дневная норма воды</span>
            <h3 className="text-3xl font-black mt-1">{currentWaterTotal} <span className="text-base font-semibold text-white/70">/ {waterGoal} мл</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 text-lg font-black">
            {waterPercent}%
          </div>
        </div>

        <div className="w-full h-2.5 bg-white/20 rounded-full my-4 overflow-hidden pointer-events-none">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
        </div>

        <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {[150, 250, 500].map(amount => (
              <button
                key={amount}
                onClick={e => {
                  e.stopPropagation();
                  if (!isEditing) onQuickAddWater(amount);
                }}
                style={{ color: waterTheme.primary }}
                className="px-3 py-1.5 rounded-xl bg-white font-bold text-xs active:scale-90 shadow-xs pointer-events-auto"
              >
                +{amount} мл
              </button>
            ))}
          </div>
          <span className="text-xs text-white/80 font-bold underline pointer-events-none">Открыть трекер →</span>
        </div>
      </div>
    );
  };

  // 3. PILLS WIDGET
  const renderPillsWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${pillsTheme.primary}60`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${pillsTheme.primary} 0%, ${pillsTheme.secondary} 100%)`,
      ...dragStyle
    };

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('pills')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <PillIcon className="w-5 h-5 text-white/90 shrink-0" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">{takenDosesToday}/{totalDosesToday}</span>
          </div>

          <div className="my-1 pointer-events-none">
            {nextPillInfo ? (
              <>
                <p className="text-xs font-black truncate text-white leading-tight">{nextPillInfo.pill.name}</p>
                <p className="text-[10px] text-white/80 mt-0.5">{nextPillInfo.time}</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Все выпито</p>
                <p className="text-[10px] text-white/80">Отличный день</p>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80 pointer-events-none">
            <span>Все таблетки</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      );
    }

    if (size === 'medium') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('pills')}
          style={cardGradientStyle}
          className={`relative p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <PillIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Лекарства и витамины</span>
                <div className="text-sm font-black truncate">
                  {nextPillInfo ? `${nextPillInfo.pill.name} в ${nextPillInfo.time}` : totalDosesToday > 0 ? '✓ Все таблетки приняты' : 'Список пуст'}
                </div>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
              {takenDosesToday}/{totalDosesToday}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-white/80 pointer-events-none">
            <span className="truncate pr-1">{nextPillInfo ? `Дозировка: ${nextPillInfo.pill.dosage}` : 'Открыть расписание'}</span>
            <span className="font-bold flex items-center gap-0.5 text-white shrink-0">Открыть <ChevronRight className="w-4 h-4" /></span>
          </div>
        </div>
      );
    }

    // Large
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('pills')}
        style={cardGradientStyle}
        className={`relative p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">График приема препаратов</span>
            <h3 className="text-2xl font-black mt-0.5">Принято {takenDosesToday} из {totalDosesToday} доз</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <PillIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="my-3 space-y-1.5">
          {activePills.slice(0, 3).map(p => {
            const isTaken = appData.pillLogs.some(
              l => l.pillId === p.id && l.date === todayStr && l.status === 'taken'
            );
            return (
              <div key={p.id} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                <div className="pointer-events-none truncate pr-2">
                  <span className="font-bold truncate">{p.name}</span>
                  <span className="text-[11px] text-white/70 ml-2">({p.times.join(', ')})</span>
                </div>
                {isTaken ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1 pointer-events-none shrink-0"><Check className="w-3.5 h-3.5" /> Выпито</span>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!isEditing && onLogPillTaken && p.times[0]) {
                        onLogPillTaken(p.id, p.times[0]);
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 font-bold text-[11px] transition-colors pointer-events-auto shrink-0"
                  >
                    + Выпить
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/80 pointer-events-none">
          <span>Управление списком и напоминаниями</span>
          <span className="font-bold text-white underline">Все препараты →</span>
        </div>
      </div>
    );
  };

  // 4. TIP WIDGET
  const renderTipWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${globalTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const tipText = 
      prediction.currentPhase === 'menstruation' ? 'Пейте больше теплой воды, добавьте в рацион железо и уделите время отдыху.' :
      prediction.currentPhase === 'follicular' ? 'Отличное время для активности, планов и тренировок. Энергия на подъеме!' :
      prediction.currentPhase === 'ovulation' ? 'Пик уверенности и фертильности. Поддерживайте баланс и пейте воду.' :
      'Снизьте кофеин и стресс. Добавьте магний и теплые травяные чаи.';

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={dragStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl glass-card border border-slate-200 shadow-xs flex flex-col justify-between min-h-[160px] h-full select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <span
              style={{ color: globalTheme.primary, backgroundColor: `${globalTheme.primary}15` }}
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            >
              Совет
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-600 leading-snug my-1 line-clamp-3 pointer-events-none">
            {tipText}
          </p>
          <span className="text-[10px] font-bold pointer-events-none truncate" style={{ color: globalTheme.primary }}>
            Фаза: {prediction.phaseName}
          </span>
        </div>
      );
    }

    if (size === 'medium') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={dragStyle}
          className={`relative p-4 rounded-3xl glass-card border border-slate-200 shadow-xs flex items-start gap-3 select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div
            style={{ backgroundColor: `${globalTheme.primary}15`, color: globalTheme.primary }}
            className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 pointer-events-none"
          >
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div className="pointer-events-none min-w-0">
            <h4 className="text-xs font-bold text-slate-800">Совет дня для фазы «{prediction.phaseName}»</h4>
            <p className="text-[11px] text-[#595959] mt-0.5 leading-snug">{tipText}</p>
          </div>
        </div>
      );
    }

    // Large
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        style={dragStyle}
        className={`relative p-5 rounded-3xl glass-card border border-slate-200 shadow-sm space-y-3 select-none overflow-hidden ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-center gap-2 pointer-events-none">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-slate-800">Гид по вашей текущей фазе ({prediction.phaseName})</h4>
            <p className="text-[11px] text-[#595959]">Рекомендации по телу и питанию</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs pt-1 pointer-events-none">
          <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 border border-slate-100">
            <span className="font-bold block mb-0.5 truncate" style={{ color: globalTheme.primary }}>Питание</span>
            <span className="text-[10px] text-[#595959] leading-tight">Свежие продукты</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 border border-slate-100">
            <span className="font-bold block mb-0.5 truncate" style={{ color: globalTheme.primary }}>Спорт</span>
            <span className="text-[10px] text-[#595959] leading-tight">По ощущениям</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 border border-slate-100">
            <span className="font-bold block mb-0.5 truncate" style={{ color: globalTheme.primary }}>Сон</span>
            <span className="text-[10px] text-[#595959] leading-tight">8+ часов отдыха</span>
          </div>
        </div>
      </div>
    );
  };

  // 5. DIVIDER / SPACER ELEMENT
  const renderDividerWidget = (widget: WidgetConfig, idx: number) => {
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;
    const style = widget.dividerStyle || 'line';
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${globalTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    if (style === 'blank') {
      const heightClass = widget.size === 'small' ? 'min-h-[160px]' : widget.size === 'medium' ? 'min-h-[220px]' : 'min-h-[320px]';
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={dragStyle}
          className={`relative ${heightClass} w-full transition-all flex items-center justify-center select-none ${
            isEditing ? 'border-2 border-dashed rounded-3xl touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          {isEditing && (
            <span className="text-xs font-bold pointer-events-none" style={{ color: globalTheme.primary }}>
              Пустой отступ
            </span>
          )}
        </div>
      );
    }

    // Line Divider
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        style={dragStyle}
        className={`relative py-3 flex items-center justify-center select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent pointer-events-none" />
      </div>
    );
  };

  // 6. PHOTO / CUSTOM IMAGE WIDGET
  const renderPhotoWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size === 'medium' ? 'large' : widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${globalTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const minHeightClass = size === 'small' ? 'min-h-[160px] h-full' : 'min-h-[320px]';

    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => {
          if (!isEditing) {
            triggerUploadForWidget(widget.id);
          }
        }}
        style={dragStyle}
        className={`relative ${minHeightClass} w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 select-none group cursor-pointer transition-shadow bg-white ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}

        {widget.imageUrl ? (
          <div className="w-full h-full relative">
            <img
              src={widget.imageUrl}
              alt="Моё фото"
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span
                style={{ backgroundColor: `${globalTheme.primary}CC` }}
                className="text-[10px] font-bold text-white backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
              >
                <Camera className="w-3 h-3" /> Сменить фото
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-4 bg-slate-50 text-[#595959] text-center gap-2 border-2 border-dashed border-slate-300 rounded-3xl hover:bg-slate-100 transition-colors">
            <div
              style={{ color: globalTheme.primary }}
              className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center"
            >
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Добавьте фото</p>
              <p className="text-[10px] text-[#595959]">Нажмите, чтобы выбрать фото с телефона</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // TASKS WIDGET
  const renderTasksWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const todayTasksList = (appData.tasks || []).filter(t => t.date === todayStr);
    const activeTasks = todayTasksList.filter(t => !t.completed);
    const completedTasksCount = todayTasksList.filter(t => t.completed).length;
    const progressPercent = todayTasksList.length > 0 ? Math.round((completedTasksCount / todayTasksList.length) * 100) : 0;

    const cardGradientStyle: React.CSSProperties = isThisDragged
      ? {
          background: `linear-gradient(135deg, ${tasksTheme.primary} 0%, ${tasksTheme.secondary} 100%)`,
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${tasksTheme.primary}60`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {
          background: `linear-gradient(135deg, ${tasksTheme.primary} 0%, ${tasksTheme.secondary} 100%)`
        };

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('tasks')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xl">📝</span>
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">{progressPercent}%</span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{activeTasks.length}</h3>
            <p className="text-[11px] text-white/80 font-medium">
              {activeTasks.length === 1 ? 'активная задача' : activeTasks.length < 5 ? 'активные задачи' : 'активных задач'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-bold text-white/90">План на день</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/80" />
          </div>
        </div>
      );
    }

    if (size === 'medium') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('tasks')}
          style={cardGradientStyle}
          className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg border border-white/20">
                📝
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Задачи на сегодня</span>
                <div className="text-sm font-black">
                  {todayTasksList.length === 0 ? 'Нет задач' : `Выполнено ${completedTasksCount} из ${todayTasksList.length}`}
                </div>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
              {progressPercent}%
            </span>
          </div>

          {/* Top 2 Active Tasks preview */}
          <div className="mt-2.5 space-y-1.5 pointer-events-none">
            {todayTasksList.length > 0 ? (
              todayTasksList.slice(0, 2).map(t => (
                <div key={t.id} className="flex items-center gap-2 text-xs bg-white/10 rounded-xl px-2.5 py-1.5 backdrop-blur-xs">
                  <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${t.completed ? 'bg-white text-slate-900 border-white' : 'border-white/60'}`}>
                    {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`truncate ${t.completed ? 'line-through opacity-70' : 'font-semibold'}`}>{t.title}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/80 py-1">Все задачи выполнены или еще не запланированы</p>
            )}
          </div>
        </div>
      );
    }

    // Large
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('tasks')}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none overflow-hidden space-y-3 ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing' : ''
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">План и задачи на день</span>
            <h3 className="text-2xl font-black mt-0.5">
              {todayTasksList.length === 0 ? 'Свободный день' : `Выполнено ${completedTasksCount} из ${todayTasksList.length}`}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 text-base font-black">
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden pointer-events-none">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Task list preview */}
        <div className="space-y-1.5 pointer-events-none">
          {todayTasksList.length > 0 ? (
            todayTasksList.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs bg-white/10 rounded-xl px-3 py-2 backdrop-blur-xs">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${t.completed ? 'bg-white text-slate-900 border-white' : 'border-white/60'}`}>
                  {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={`truncate flex-1 ${t.completed ? 'line-through opacity-70' : 'font-semibold'}`}>{t.title}</span>
                {t.time && <span className="text-[10px] text-white/80 shrink-0">{t.time}</span>}
              </div>
            ))
          ) : (
            <p className="text-xs text-white/80 py-1">Нажмите, чтобы открыть планировщик задач</p>
          )}
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between pointer-events-none">
          <span className="text-xs font-bold text-white/90">Открыть календарь задач →</span>
          <ChevronRight className="w-4 h-4 text-white/80" />
        </div>
      </div>
    );
  };

  const renderWidgetByConfig = (widget: WidgetConfig, idx: number) => {
    switch (widget.type) {
      case 'cycle': return renderCycleWidget(widget, idx);
      case 'tasks': return renderTasksWidget(widget, idx);
      case 'water': return renderWaterWidget(widget, idx);
      case 'pills': return renderPillsWidget(widget, idx);
      case 'tip': return renderTipWidget(widget, idx);
      case 'divider': return renderDividerWidget(widget, idx);
      case 'photo': return renderPhotoWidget(widget, idx);
    }
  };

  /* =======================================================
     AUTHENTIC iOS 18 2D MATRIX ENGINE (1-to-1 Spatial Parity)
     ======================================================= */
  const maxRow = activeWidgets.length > 0 ? Math.max(...activeWidgets.map(w => w.row)) : 0;
  const totalGridRows = isEditing ? Math.max(maxRow + 3, 5) : maxRow + 1;

  const renderedRows: React.ReactNode[] = [];

  for (let r = 0; r < totalGridRows; r++) {
    const rowWidgets = activeWidgets.filter(w => w.row === r);
    const fullRowWidget = rowWidgets.find(w => w.size !== 'small' || w.type === 'divider');

    if (fullRowWidget) {
      // Medium / Large / Divider row
      const isTargetSlot = dragSession?.hasMoved && dragSession.hoverSlot?.row === r;

      renderedRows.push(
        <div
          key={`row-full-${r}-${fullRowWidget.id}`}
          data-grid-slot="true"
          data-grid-row={r}
          data-grid-col={0}
          style={isTargetSlot ? { outlineColor: globalTheme.primary } : undefined}
          className={`w-full transition-all relative ${
            isTargetSlot ? 'ring-2 ring-offset-2 rounded-3xl' : ''
          }`}
        >
          {renderWidgetByConfig(fullRowWidget, fullRowWidget.order)}
        </div>
      );
    } else {
      // 2-Column Row for Small Widgets or Empty Space
      const leftWidget = rowWidgets.find(w => w.col === 0);
      const rightWidget = rowWidgets.find(w => w.col === 1);

      const isLeftHovered = dragSession?.hasMoved && dragSession.hoverSlot?.row === r && dragSession.hoverSlot?.col === 0;
      const isRightHovered = dragSession?.hasMoved && dragSession.hoverSlot?.row === r && dragSession.hoverSlot?.col === 1;

      renderedRows.push(
        <div key={`row-2col-${r}`} className="grid grid-cols-2 gap-3.5 min-h-[160px]">
          {/* Left Slot (r, 0) */}
          <div
            data-grid-slot="true"
            data-grid-row={r}
            data-grid-col={0}
            style={
              isLeftHovered
                ? { borderColor: globalTheme.primary, backgroundColor: `${globalTheme.primary}15` }
                : undefined
            }
            className={`min-h-[160px] h-full rounded-3xl transition-all relative ${
              isLeftHovered
                ? 'border-2 scale-[1.02] shadow-inner flex items-center justify-center'
                : isEditing && !leftWidget
                ? 'border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100'
                : ''
            }`}
            onClick={() => {
              if (isEditing && !leftWidget && !dragSession?.hasMoved) {
                setTargetSlotForAdd({ row: r, col: 0 });
                setIsAddModalOpen(true);
              }
            }}
          >
            {leftWidget ? (
              renderWidgetByConfig(leftWidget, leftWidget.order)
            ) : isEditing ? (
              <div className="flex flex-col items-center gap-1 pointer-events-none" style={{ color: globalTheme.primary }}>
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Свободно</span>
              </div>
            ) : (
              <div className="w-full min-h-[160px] pointer-events-none" />
            )}
          </div>

          {/* Right Slot (r, 1) */}
          <div
            data-grid-slot="true"
            data-grid-row={r}
            data-grid-col={1}
            style={
              isRightHovered
                ? { borderColor: globalTheme.primary, backgroundColor: `${globalTheme.primary}15` }
                : undefined
            }
            className={`min-h-[160px] h-full rounded-3xl transition-all relative ${
              isRightHovered
                ? 'border-2 scale-[1.02] shadow-inner flex items-center justify-center'
                : isEditing && !rightWidget
                ? 'border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100'
                : ''
            }`}
            onClick={() => {
              if (isEditing && !rightWidget && !dragSession?.hasMoved) {
                setTargetSlotForAdd({ row: r, col: 1 });
                setIsAddModalOpen(true);
              }
            }}
          >
            {rightWidget ? (
              renderWidgetByConfig(rightWidget, rightWidget.order)
            ) : isEditing ? (
              <div className="flex flex-col items-center gap-1 pointer-events-none" style={{ color: globalTheme.primary }}>
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Свободно</span>
              </div>
            ) : (
              <div className="w-full min-h-[160px] pointer-events-none" />
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div ref={containerRef} className="space-y-4 pb-8 animate-fade-in select-none">
      {/* Hidden File Input for Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* iOS-Style Editing Top Toolbar OR Standard Welcome Header */}
      {isEditing ? (
        <div
          style={{ backgroundColor: globalTheme.primary }}
          className="p-3.5 rounded-3xl text-white shadow-xl flex items-center justify-between animate-fade-in sticky top-16 z-40 border border-white/20"
        >
          <button
            onClick={() => {
              setTargetSlotForAdd(null);
              setIsAddModalOpen(true);
            }}
            className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center font-bold active:scale-90 transition-transform cursor-pointer hover:bg-white/25 shrink-0"
            title="Добавить виджет, фото или дивидер"
          >
            <Plus className="w-5 h-5" />
          </button>

          <div className="text-center px-2 min-w-0">
            <p className="text-xs font-bold truncate">Настройка рабочего стола</p>
            <p className="text-[10px] text-white/80 truncate">Перетаскивайте виджеты в любые слоты</p>
          </div>

          <button
            onClick={() => setIsEditing(false)}
            style={{ color: globalTheme.primary }}
            className="px-4 py-1.5 rounded-full bg-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer hover:bg-slate-100 shrink-0"
          >
            <span>Готово</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-3xl glass-card border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenProfile}
              style={{
                background: `linear-gradient(135deg, ${globalTheme.primary} 0%, ${globalTheme.secondary} 100%)`
              }}
              className="w-11 h-11 rounded-2xl shadow-md shadow-slate-300 flex items-center justify-center text-xl text-white active:scale-95 transition-transform relative cursor-pointer shrink-0"
            >
              <span>{profile.avatarEmoji || '🌸'}</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </button>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 text-sm leading-tight truncate">
                Привет, {profile.name || 'MyPlace'}
              </h2>
              <p className="text-[11px] text-[#595959] mt-0.5 truncate">
                Зажмите экран для редактирования
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            style={{ color: globalTheme.primary }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all hover:bg-slate-200 shadow-2xs cursor-pointer border border-slate-200 shrink-0"
          >
            <span>Изменить</span>
          </button>
        </div>
      )}

      {/* 2D GRID OF WIDGETS, PHOTOS, SPACERS & EMPTY SLOTS */}
      <div className="space-y-3.5">
        {renderedRows}
      </div>

      {/* If all widgets are hidden */}
      {activeWidgets.length === 0 && (
        <div className="p-10 rounded-3xl glass-card text-center text-[#595959] space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center">
            <MyPlaceLogo
              className="w-10 h-10"
              primaryColor={globalTheme.primary}
              secondaryColor={globalTheme.secondary}
            />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Экран пуст</h3>
          <p className="text-xs text-[#595959]">Добавьте нужные виджеты, фото или дивидеры</p>
          <button
            onClick={() => {
              setTargetSlotForAdd(null);
              setIsAddModalOpen(true);
            }}
            style={{ backgroundColor: globalTheme.primary }}
            className="px-4 py-2 rounded-2xl text-white font-bold text-xs shadow-md shadow-slate-300 active:scale-95 cursor-pointer"
          >
            + Добавить элемент
          </button>
        </div>
      )}

      {/* iOS Widget Gallery Modal with Photo & Divider options */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        activeWidgets={rawWidgets}
        onAddWidget={handleAddWidgetFromGallery}
        onClose={() => {
          setIsAddModalOpen(false);
          setTargetSlotForAdd(null);
        }}
      />
    </div>
  );
};
