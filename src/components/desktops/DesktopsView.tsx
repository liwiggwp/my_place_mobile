import React, { useState, useRef, useEffect } from 'react';
import type { AppData, CyclePrediction, WidgetConfig, WidgetSize, WidgetType, DashboardDesktop, TabType, DualColorTheme } from '../../types';
import { getTodayString, getMonthMatrix, parseDateString } from '../../utils/dateUtils';
import { getDateStatus } from '../../utils/cycleCalculations';
import { getScreenTheme } from '../../utils/themeUtils';
import {
  Droplets,
  Pill as PillIcon,
  ChevronRight,
  Plus,
  Check,
  Minimize2,
  MonitorPlay,
  Camera,
  Heart,
  Lightbulb,
  CheckSquare,
  Clock,
  Layers,
  X,
  Maximize2
} from 'lucide-react';
import { ManageDesktopsModal, renderDesktopIcon } from './ManageDesktopsModal';
import { AddDesktopWidgetModal } from './AddDesktopWidgetModal';

interface DesktopsViewProps {
  appData: AppData;
  prediction: CyclePrediction;
  customDesktops: DashboardDesktop[];
  activeCustomDesktopId?: string;
  theme?: DualColorTheme;
  onSelectDesktop: (id: string) => void;
  onCreateDesktop: (desktop: DashboardDesktop) => void;
  onUpdateDesktop: (desktop: DashboardDesktop) => void;
  onDeleteDesktop: (id: string) => void;
  onNavigate: (tab: TabType) => void;
  onQuickAddWater: (amount: number) => void;
  onLogPillTaken?: (pillId: string, scheduledTime: string) => void;
  onToggleTask?: (taskId: string) => void;
}

interface DragSession {
  widgetId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
  hoverSlot: { row: number; col: 0 | 1 } | null;
}

const russianShortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const russianMonths = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const DesktopsView: React.FC<DesktopsViewProps> = ({
  appData,
  prediction,
  customDesktops,
  activeCustomDesktopId,
  onSelectDesktop,
  onCreateDesktop,
  onUpdateDesktop,
  onDeleteDesktop,
  onNavigate,
  onQuickAddWater,
  onLogPillTaken,
  onToggleTask
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageDesktopsOpen, setIsManageDesktopsOpen] = useState(false);
  const [isStandbyMode, setIsStandbyMode] = useState(false);
  const [targetSlotForAdd, setTargetSlotForAdd] = useState<{ row: number; col: 0 | 1 } | null>(null);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [activePhotoUploadWidgetId, setActivePhotoUploadWidgetId] = useState<string | null>(null);

  // Live time ticker for clock widgets and standby mode
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Screen Wake Lock API for Standby Mode
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (isStandbyMode) {
      if ('wakeLock' in navigator) {
        (navigator as any).wakeLock
          .request('screen')
          .then((wl: any) => {
            wakeLockRef.current = wl;
          })
          .catch(() => {
            // Wake lock failed or permission denied
          });
      }
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isStandbyMode]);

  // Determine active desktop
  const activeDesktop =
    customDesktops.find(d => d.id === activeCustomDesktopId) ||
    customDesktops[0] ||
    null;

  const rawWidgets = activeDesktop?.widgets || [];
  const activeWidgets = rawWidgets.filter(w => w.enabled);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopBarRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll refs for desktop switcher
  const isDraggingDesktops = useRef(false);
  const startXDesktops = useRef(0);
  const scrollLeftDesktops = useRef(0);
  const hasMovedDesktops = useRef(false);

  const todayStr = getTodayString();
  const todayDate = parseDateString(todayStr);

  // Themes
  const globalTheme = getScreenTheme(appData.themeSettings, 'global');
  const cycleTheme = getScreenTheme(appData.themeSettings, 'cycle');
  const tasksTheme = getScreenTheme(appData.themeSettings, 'tasks');
  const waterTheme = getScreenTheme(appData.themeSettings, 'water');
  const pillsTheme = getScreenTheme(appData.themeSettings, 'pills');

  /* ==========================================
     DRAG & DROP MATRIX ENGINE
     ========================================== */
  useEffect(() => {
    dragSessionRef.current = dragSession;
  }, [dragSession]);

  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      // Cancel long press if user moved finger/cursor (e.g. scrolling or tapping)
      if (pointerStartPos.current && longPressTimer.current) {
        const moveDist = Math.hypot(e.clientX - pointerStartPos.current.x, e.clientY - pointerStartPos.current.y);
        if (moveDist > 8) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
          pointerStartPos.current = null;
        }
      }

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
      if (session && session.hasMoved && session.hoverSlot && activeDesktop) {
        const { widgetId, hoverSlot } = session;
        const draggedWidget = rawWidgets.find(w => w.id === widgetId);

        if (draggedWidget) {
          const targetWidget = activeWidgets.find(
            w =>
              w.row === hoverSlot.row &&
              (w.size === 'small' && draggedWidget.size === 'small' ? w.col === hoverSlot.col : true)
          );

          let updated: WidgetConfig[];

          if (targetWidget && targetWidget.id !== widgetId) {
            // Clean swap of coordinates
            updated = rawWidgets.map(w => {
              if (w.id === widgetId) {
                return {
                  ...w,
                  row: hoverSlot.row,
                  col: (draggedWidget.size === 'small' ? hoverSlot.col : 0) as 0 | 1
                };
              }
              if (w.id === targetWidget.id) {
                return {
                  ...w,
                  row: draggedWidget.row,
                  col: (targetWidget.size === 'small' ? draggedWidget.col : 0) as 0 | 1
                };
              }
              return w;
            });
          } else {
            // Drop in empty slot
            updated = rawWidgets.map(w => {
              if (w.id === widgetId) {
                return {
                  ...w,
                  row: hoverSlot.row,
                  col: (draggedWidget.size === 'small' ? hoverSlot.col : 0) as 0 | 1
                };
              }
              return w;
            });
          }

          onUpdateDesktop({ ...activeDesktop, widgets: updated });
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
  }, [isEditing, rawWidgets, activeWidgets, activeDesktop, onUpdateDesktop]);

  /* ==========================================
     DRAG-TO-SCROLL FOR DESKTOP BAR
     ========================================== */
  const handleDesktopsMouseDown = (e: React.MouseEvent) => {
    if (!desktopBarRef.current) return;
    isDraggingDesktops.current = true;
    hasMovedDesktops.current = false;
    startXDesktops.current = e.pageX - desktopBarRef.current.offsetLeft;
    scrollLeftDesktops.current = desktopBarRef.current.scrollLeft;
  };

  const handleDesktopsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingDesktops.current || !desktopBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - desktopBarRef.current.offsetLeft;
    const walk = (x - startXDesktops.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedDesktops.current = true;
    }
    desktopBarRef.current.scrollLeft = scrollLeftDesktops.current - walk;
  };

  const handleDesktopsMouseUpOrLeave = () => {
    isDraggingDesktops.current = false;
  };

  /* ==========================================
     LONG-PRESS TO EDIT
     ========================================== */
  const handleCardPointerDown = (e: React.PointerEvent, widgetId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (!isEditing) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      pointerStartPos.current = { x: e.clientX, y: e.clientY };
      longPressTimer.current = window.setTimeout(() => {
        setIsEditing(true);
        if (navigator.vibrate) navigator.vibrate(40);
        longPressTimer.current = null;
        pointerStartPos.current = null;
      }, 800);
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
    pointerStartPos.current = null;
  };

  /* ==========================================
     WIDGET MANAGEMENT HANDLERS
     ========================================== */
  const handleToggleWidget = (widgetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeDesktop) return;

    const updated = rawWidgets.filter(w => w.id !== widgetId);
    onUpdateDesktop({ ...activeDesktop, widgets: updated });
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Safe Size Cycle with Automatic Collision Prevention (same as HomeDashboard)
  const handleChangeSize = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeDesktop) return;

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

    onUpdateDesktop({ ...activeDesktop, widgets: updatedList });
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleAddWidget = (
    type: WidgetType,
    size: WidgetSize,
    taskCategoryFilter?: string,
    dividerStyle: 'blank' | 'line' = 'blank',
    imageUrl?: string
  ) => {
    if (!activeDesktop) return;

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

    const effectiveSize = type === 'photo' && size === 'medium' ? 'large' : size;
    const newWidgetId = `${type}-${Date.now()}`;

    const newWidget: WidgetConfig = {
      id: newWidgetId,
      type,
      title:
        type === 'clock'
          ? 'Часы и Время'
          : type === 'tasks'
          ? 'Задачи'
          : type === 'water'
          ? 'Водный Баланс'
          : type === 'pills'
          ? 'Лекарства и Витамины'
          : type === 'cycle'
          ? 'Мой Цикл'
          : type === 'tip'
          ? 'Совет Дня'
          : type === 'photo'
          ? 'Моё фото'
          : dividerStyle === 'blank'
          ? 'Пустой отступ'
          : 'Дивидер',
      enabled: true,
      size: effectiveSize,
      order: baseWidgets.length,
      row: targetRow,
      col: (effectiveSize === 'small' ? targetCol : 0) as 0 | 1,
      dividerStyle,
      imageUrl,
      taskCategoryFilter
    };

    onUpdateDesktop({
      ...activeDesktop,
      widgets: [...baseWidgets, newWidget]
    });
    setTargetSlotForAdd(null);

    if (type === 'photo') {
      setTimeout(() => {
        setActivePhotoUploadWidgetId(newWidgetId);
        fileInputRef.current?.click();
      }, 100);
    }
  };

  const triggerUploadForWidget = (widgetId: string) => {
    setActivePhotoUploadWidgetId(widgetId);
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoUploadWidgetId || !activeDesktop) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
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
          onUpdateDesktop({ ...activeDesktop, widgets: updated });
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const renderEditControls = (widget: WidgetConfig) => {
    if (!isEditing) return null;

    return (
      <>
        {/* White (✕) Delete Button right on top-right corner protruding outside */}
        <button
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            handleToggleWidget(widget.id, e);
          }}
          className="absolute -top-2 -right-2 z-50 w-6 h-6 rounded-full bg-white hover:bg-slate-100 active:scale-90 text-slate-800 flex items-center justify-center font-bold shadow-md border border-slate-300/80 cursor-pointer transition-transform pointer-events-auto shrink-0 animate-fade-in"
          title="Удалить"
        >
          <X className="w-3 h-3 stroke-[2.5]" />
        </button>

        {/* Size Cycler Button placed on bottom-right corner to NOT overlap top icons */}
        {(widget.type !== 'divider' || widget.dividerStyle === 'blank') && (
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              handleChangeSize(widget.id, e);
            }}
            className="absolute bottom-2 right-2 z-40 px-2 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-white font-black text-[10px] uppercase shadow-md border border-white/30 flex items-center gap-1 active:scale-90 hover:bg-slate-900 cursor-pointer transition-transform pointer-events-auto shrink-0 animate-fade-in"
            title="Сменить размер"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>{widget.size.toUpperCase()}</span>
          </button>
        )}
      </>
    );
  };

  /* =======================================================
     WIDGET RENDERERS
     ======================================================= */

  // 1. CLOCK & DATE WIDGET (LIVE TICKER)
  const renderClockWidget = (widget: WidgetConfig, idx: number) => {
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

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${globalTheme.primary} 0%, ${globalTheme.secondary} 100%)`,
      ...dragStyle
    };

    const hours = String(liveTime.getHours()).padStart(2, '0');
    const minutes = String(liveTime.getMinutes()).padStart(2, '0');
    const seconds = String(liveTime.getSeconds()).padStart(2, '0');
    const dayOfWeek = russianShortDays[liveTime.getDay()];
    const fullDate = `${liveTime.getDate()} ${russianMonths[liveTime.getMonth()]}`;

    const currentHour = liveTime.getHours();
    const greeting = currentHour >= 5 && currentHour < 12
      ? 'Доброе утро'
      : currentHour >= 12 && currentHour < 17
      ? 'Добрый день'
      : currentHour >= 17 && currentHour < 22
      ? 'Добрый вечер'
      : 'Доброй ночи';

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={cardGradientStyle}
          className={`relative p-4 rounded-3xl text-white shadow-md flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">{dayOfWeek}</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1 pointer-events-none">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black tracking-tight font-mono leading-none">
                {hours}:{minutes}
              </h3>
              <span className="text-xs font-bold text-white/70 font-mono">{seconds}</span>
            </div>
            <p className="text-xs font-bold text-white/90 mt-1">{fullDate}</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80 pointer-events-none">
            <span>{greeting}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      );
    }

    if (size === 'medium') {
      const minutesPassedToday = liveTime.getHours() * 60 + liveTime.getMinutes();
      const dayPercent = Math.round((minutesPassedToday / 1440) * 100);

      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={cardGradientStyle}
          className={`relative p-5 rounded-3xl text-white shadow-md select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
                {dayOfWeek}, {fullDate} • {greeting}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-4xl font-black tracking-tight font-mono">
                  {hours}:{minutes}
                </h3>
                <span className="text-base font-bold text-white/70 font-mono">{seconds}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/80">{dayPercent}% дня</span>
              <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${dayPercent}%` }} />
              </div>
            </div>
            <span className="text-xs text-white/90 font-medium">Рабочее время</span>
          </div>
        </div>
      );
    }

    // Large Size: Desk clock display with calendar matrix
    const monthMatrix = getMonthMatrix(todayDate.getFullYear(), todayDate.getMonth());
    const weekDayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl select-none space-y-4 ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
              {greeting} • {dayOfWeek}, {fullDate}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-5xl font-black tracking-tight font-mono">
                {hours}:{minutes}
              </h2>
              <span className="text-xl font-bold text-white/70 font-mono">{seconds}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Embedded Month Mini Calendar */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2 pointer-events-none">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/70">
            {weekDayShort.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="space-y-1">
            {monthMatrix.slice(0, 4).map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1 text-center text-xs">
                {week.map(day => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div
                      key={day.dateStr}
                      className={`h-6 rounded-lg flex items-center justify-center font-bold ${
                        isToday
                          ? 'bg-white text-slate-900 shadow-xs'
                          : day.isCurrentMonth
                          ? 'text-white'
                          : 'text-white/30'
                      }`}
                    >
                      <span>{day.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. TASKS WIDGET WITH OPTIONAL CATEGORY FILTER
  const renderTasksWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${tasksTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${tasksTheme.primary} 0%, ${tasksTheme.secondary} 100%)`,
      ...dragStyle
    };

    const categoryFilter = widget.taskCategoryFilter;
    const categoryItem = appData.taskCategories?.find(c => c.id === categoryFilter);
    const categoryName = categoryItem?.label || (categoryFilter === 'work' ? 'Работа' : categoryFilter === 'health' ? 'Здоровье' : '');

    let activeTasks = (appData.tasks || []).filter(t => !t.completed);
    if (categoryFilter) {
      activeTasks = activeTasks.filter(t => t.category === categoryFilter);
    }

    const todayTasksList = activeTasks.slice(0, 4);

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('tasks')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <CheckSquare className="w-5 h-5 text-white/90 shrink-0" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full truncate max-w-[80px]">
              {categoryName || 'Все'}
            </span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{activeTasks.length}</h3>
            <p className="text-[11px] text-white/80 font-medium truncate">
              {categoryName ? `Все задачи: ${categoryName}` : activeTasks.length === 0 ? 'Все сделано' : 'дел осталось'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/90 pointer-events-none">
            <span className="truncate pr-1">
              {todayTasksList[0] ? todayTasksList[0].title : 'Нажмите для задач'}
            </span>
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
          onClick={() => !isEditing && onNavigate('tasks')}
          style={cardGradientStyle}
          className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-white border border-white/20">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{categoryName ? `Фильтр: ${categoryName}` : 'Задачи и Дела'}</span>
              </div>
              <h3 className="text-xl font-black tracking-tight mt-1.5">
                {todayTasksList.length === 0 ? 'Нет активных задач' : `Осталось ${activeTasks.length} задач`}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {todayTasksList.length > 0 ? (
              todayTasksList.slice(0, 2).map(task => (
                <button
                  key={task.id}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (!isEditing && onToggleTask) {
                      onToggleTask(task.id);
                    }
                  }}
                  className="w-full p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] backdrop-blur-xs flex items-center gap-2 text-xs transition-all cursor-pointer pointer-events-auto text-left"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      task.completed ? 'bg-white text-slate-900 border-white' : 'border-white/60 hover:border-white'
                    }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`truncate font-medium flex-1 ${task.completed ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-white/80 py-1 pointer-events-none">Все задачи выполнены! Отличный день.</p>
            )}
          </div>
        </div>
      );
    }

    // Large Size
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('tasks')}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
              {categoryName ? `Задачи: ${categoryName}` : 'Задачи на сегодня'}
            </span>
            <h3 className="text-2xl font-black mt-1">
              {todayTasksList.length === 0 ? 'Отличный день!' : `${activeTasks.length} дел в списке`}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="my-3 space-y-2">
          {todayTasksList.length > 0 ? (
            todayTasksList.slice(0, 5).map(task => (
              <button
                key={task.id}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (!isEditing && onToggleTask) {
                    onToggleTask(task.id);
                  }
                }}
                className="w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] backdrop-blur-md border border-white/10 flex items-center justify-between text-xs transition-all cursor-pointer pointer-events-auto text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      task.completed ? 'bg-white text-slate-900 border-white' : 'border-white/60 hover:border-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`truncate font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </span>
                </div>
                {task.time && (
                  <span className="text-[10px] text-white/70 font-mono ml-2 shrink-0">{task.time}</span>
                )}
              </button>
            ))
          ) : (
            <p className="text-xs text-white/80 py-1 pointer-events-none">Нет активных задач. Нажмите для добавления.</p>
          )}
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs pointer-events-none">
          <span className="text-xs font-bold text-white/90">Открыть список задач</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  };

  // 3. PILLS / VITAMINS WIDGET
  const renderPillsWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${pillsTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${pillsTheme.primary} 0%, ${pillsTheme.secondary} 100%)`,
      ...dragStyle
    };

    const activePills = appData.pills.filter(p => p.active);
    let totalDosesToday = 0;
    let takenDosesToday = 0;

    activePills.forEach(p => {
      p.times.forEach(t => {
        totalDosesToday++;
        const isTaken = appData.pillLogs.some(
          l => l.pillId === p.id && l.date === todayStr && l.scheduledTime === t && l.status === 'taken'
        );
        if (isTaken) takenDosesToday++;
      });
    });

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('pills')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <PillIcon className="w-5 h-5 text-white/90 shrink-0" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
              {takenDosesToday}/{totalDosesToday}
            </span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{takenDosesToday} из {totalDosesToday}</h3>
            <p className="text-[10px] text-white/80 mt-0.5">доз принято</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] pointer-events-none">
            <span className="text-[10px] font-bold text-white/90">Таблетки</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
          className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Препараты</span>
              <h3 className="text-xl font-black mt-0.5">
                Принято {takenDosesToday} из {totalDosesToday} доз
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <PillIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs pointer-events-none">
            <span>{activePills.length} активных препаратов</span>
            <span className="font-bold flex items-center gap-0.5 text-white">Открыть →</span>
          </div>
        </div>
      );
    }

    // Large Size
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('pills')}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">График приема препаратов</span>
            <h3 className="text-2xl font-black mt-0.5">Принято {takenDosesToday} из {totalDosesToday} доз</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <PillIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="my-3 space-y-1.5">
          {activePills.slice(0, 3).map(p => {
            const isTaken = appData.pillLogs.some(
              l => l.pillId === p.id && l.date === todayStr && l.status === 'taken'
            );
            return (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="pointer-events-none truncate pr-2">
                  <span className="font-bold truncate">{p.name}</span>
                  <span className="text-[11px] text-white/70 ml-2">({p.times.join(', ')})</span>
                </div>
                {isTaken ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1 pointer-events-none shrink-0">
                    <Check className="w-3.5 h-3.5" /> Выпито
                  </span>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!isEditing && onLogPillTaken && p.times[0]) {
                        onLogPillTaken(p.id, p.times[0]);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white font-bold text-slate-800 text-[11px] active:scale-95 shadow-xs pointer-events-auto shrink-0"
                  >
                    + Принято
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs pointer-events-none">
          <span className="text-white/80">Подробнее о курсе</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  };

  // 4. WATER WIDGET
  const renderWaterWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${waterTheme.primary}40`,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const cardGradientStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${waterTheme.primary} 0%, ${waterTheme.secondary} 100%)`,
      ...dragStyle
    };

    const currentWater = (appData.waterLogs || [])
      .filter(l => l.date === todayStr)
      .reduce((sum, l) => sum + l.amount, 0);
    const waterGoal = appData.waterSettings?.dailyGoal || 2000;
    const progressPercent = Math.min(100, Math.round((currentWater / waterGoal) * 100));

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          onClick={() => !isEditing && onNavigate('water')}
          style={cardGradientStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <Droplets className="w-5 h-5 text-white/90 shrink-0" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{currentWater} мл</h3>
            <p className="text-[10px] text-white/80 mt-0.5">из {waterGoal} мл</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] pointer-events-none">
            <span className="text-[10px] font-bold text-white/90">Водный Баланс</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
          className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Гидратация</span>
              <h3 className="text-xl font-black mt-0.5">
                {currentWater} / {waterGoal} мл ({progressPercent}%)
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Droplets className="w-4 h-4" />
            </div>
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
              Подробнее <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      );
    }

    // Large Size
    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('water')}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">Дневная норма воды</span>
            <h3 className="text-3xl font-black mt-1">
              {currentWater} <span className="text-base font-semibold text-white/70">/ {waterGoal} мл</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg font-black">
            {progressPercent}%
          </div>
        </div>

        <div className="w-full h-2.5 bg-white/20 rounded-full my-4 overflow-hidden pointer-events-none">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={e => {
              e.stopPropagation();
              if (!isEditing) onQuickAddWater(250);
            }}
            style={{ color: waterTheme.primary }}
            className="px-4 py-2 rounded-2xl bg-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all pointer-events-auto"
          >
            <Plus className="w-4 h-4" /> <span>+250 мл воды</span>
          </button>
          <span className="text-xs text-white/90 font-medium pointer-events-none">Открыть дневник →</span>
        </div>
      </div>
    );
  };

  // 5. CYCLE WIDGET
  const renderCycleWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: `0 25px 50px -12px ${cycleTheme.primary}40`,
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
          className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
              {prediction.currentPhase === 'menstruation' ? 'Месячные' : `${prediction.currentDayOfCycle} дн.`}
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Heart className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1 pointer-events-none">
            <h3 className="text-2xl font-black tracking-tight">{prediction.currentDayOfCycle} день</h3>
            <p className="text-[10px] text-white/80 mt-0.5">{prediction.phaseName}</p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] pointer-events-none">
            <span>{prediction.daysUntilNextPeriod > 0 ? `Через ${prediction.daysUntilNextPeriod} дн.` : 'Месячные'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
          className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-start justify-between pointer-events-none">
            <div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">Женский календарь</span>
              <h3 className="text-xl font-black tracking-tight mt-0.5">
                {prediction.currentDayOfCycle}-й день цикла • {prediction.phaseName}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Heart className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs pointer-events-none">
            <span>Период через {prediction.daysUntilNextPeriod} дн.</span>
            <span className="font-bold flex items-center gap-0.5 text-white">Открыть →</span>
          </div>
        </div>
      );
    }

    // Large Size
    const monthMatrix = getMonthMatrix(todayDate.getFullYear(), todayDate.getMonth());
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        onClick={() => !isEditing && onNavigate('cycle')}
        style={cardGradientStyle}
        className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-xl cursor-pointer active:scale-[0.98] transition-shadow select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="flex items-start justify-between pointer-events-none">
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">Женский цикл</span>
            <h2 className="text-3xl font-black tracking-tight mt-0.5">{prediction.currentDayOfCycle}-й день цикла</h2>
            <p className="text-xs text-white/80 mt-1">{prediction.phaseName}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2 pointer-events-none">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/70">
            {weekDays.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="space-y-1">
            {monthMatrix.slice(0, 4).map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1 text-center text-xs">
                {week.map(day => {
                  const status = getDateStatus(day.dateStr, appData.periods, appData.cycleSettings);
                  const isToday = day.dateStr === todayStr;

                  let badgeClass = 'text-white/60';
                  if (status.isPeriod) badgeClass = 'bg-rose-500 text-white font-bold shadow-xs';
                  else if (status.isPredictedPeriod) badgeClass = 'border border-dashed border-rose-300 text-white font-bold';
                  else if (status.isOvulation) badgeClass = 'bg-purple-500 text-white font-bold shadow-xs';
                  else if (status.isFertile) badgeClass = 'bg-sky-400 text-white font-bold';
                  else if (isToday) badgeClass = 'bg-white text-slate-900 font-black shadow-xs';

                  return (
                    <div
                      key={day.dateStr}
                      className={`h-7 rounded-xl flex items-center justify-center transition-all ${badgeClass} ${
                        day.isCurrentMonth ? '' : 'opacity-30'
                      }`}
                    >
                      <span>{day.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 6. TIP WIDGET
  const renderTipWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const tipText = 'Сделай паузу и выпей стакан воды — это освежит разум и поднимет настроение.';

    if (size === 'small') {
      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={dragStyle}
          className={`relative p-3.5 sm:p-4 rounded-3xl glass-card border border-slate-200 shadow-xs flex flex-col justify-between min-h-[160px] h-full select-none ${
            isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              Совет
            </span>
          </div>

          <div className="my-1 pointer-events-none">
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-4 font-medium">
              {tipText}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium pointer-events-none">
            Вдохновение на день
          </div>
        </div>
      );
    }

    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        style={dragStyle}
        className={`relative p-4 rounded-3xl glass-card border border-slate-200 shadow-xs flex items-start gap-3.5 select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="pointer-events-none flex-1">
          <h4 className="text-xs font-bold text-slate-800">Совет дня</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tipText}</p>
        </div>
      </div>
    );
  };

  // 7. DIVIDER WIDGET
  const renderDividerWidget = (widget: WidgetConfig, idx: number) => {
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;
    const style = widget.dividerStyle || 'blank';
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.02)`,
          zIndex: 50,
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    if (style === 'blank') {
      const heightClass =
        widget.size === 'small'
          ? 'min-h-[80px]'
          : widget.size === 'medium'
          ? 'min-h-[160px]'
          : 'min-h-[260px]';

      return (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          onPointerDown={e => handleCardPointerDown(e, widget.id)}
          onPointerUp={handleCardPointerUp}
          style={dragStyle}
          className={`relative ${heightClass} w-full transition-all flex items-center justify-center select-none ${
            isEditing
              ? 'border-2 border-dashed border-slate-300 rounded-3xl touch-none cursor-grab active:cursor-grabbing overflow-visible bg-slate-50/50'
              : 'overflow-hidden'
          } ${jiggleClass}`}
        >
          {renderEditControls(widget)}
          {isEditing && (
            <span className="text-xs font-bold pointer-events-none text-slate-400">
              Пустой отступ ({widget.size.toUpperCase()})
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
        className={`relative py-3 w-full flex items-center justify-center select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-1 pointer-events-none" />
      </div>
    );
  };

  // 8. PHOTO / POSTER WIDGET
  const renderPhotoWidget = (widget: WidgetConfig, idx: number) => {
    const size = widget.size;
    const isThisDragged = dragSession?.widgetId === widget.id && dragSession.hasMoved;
    const jiggleClass = isEditing ? (idx % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : '';

    const dragStyle: React.CSSProperties = isThisDragged
      ? {
          transform: `translate3d(${dragSession.currentX - dragSession.startX}px, ${dragSession.currentY - dragSession.startY}px, 0) scale(1.05)`,
          zIndex: 50,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          opacity: 0.95,
          pointerEvents: 'none'
        }
      : {};

    const minHeightClass = size === 'small' ? 'min-h-[160px] h-full' : 'min-h-[220px]';

    return (
      <div
        key={widget.id}
        data-widget-id={widget.id}
        onPointerDown={e => handleCardPointerDown(e, widget.id)}
        onPointerUp={handleCardPointerUp}
        style={dragStyle}
        className={`relative ${minHeightClass} w-full rounded-3xl shadow-md border border-slate-200 select-none group ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls(widget)}

        {widget.imageUrl ? (
          <div className="relative w-full h-full min-h-[160px]">
            <img
              src={widget.imageUrl}
              alt="Мой постер"
              className="w-full h-full object-cover rounded-3xl"
            />
            {isEditing && (
              <button
                onClick={() => triggerUploadForWidget(widget.id)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs text-white flex items-center justify-center font-bold text-xs gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Сменить фото</span>
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => triggerUploadForWidget(widget.id)}
            className="w-full h-full min-h-[160px] bg-slate-100/80 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center text-slate-500"
          >
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-slate-600">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Загрузить фото</span>
            <span className="text-[10px] text-slate-400">Нажмите для выбора снимка</span>
          </div>
        )}
      </div>
    );
  };

  const renderWidgetByConfig = (widget: WidgetConfig, idx: number) => {
    switch (widget.type) {
      case 'clock':
        return renderClockWidget(widget, idx);
      case 'tasks':
        return renderTasksWidget(widget, idx);
      case 'pills':
        return renderPillsWidget(widget, idx);
      case 'water':
        return renderWaterWidget(widget, idx);
      case 'cycle':
        return renderCycleWidget(widget, idx);
      case 'tip':
        return renderTipWidget(widget, idx);
      case 'divider':
        return renderDividerWidget(widget, idx);
      case 'photo':
        return renderPhotoWidget(widget, idx);
      default:
        return null;
    }
  };

  /* ==========================================
     STANDBY AMBIENT FULL-SCREEN MODE
     ========================================== */
  if (isStandbyMode && activeDesktop) {
    const hours = String(liveTime.getHours()).padStart(2, '0');
    const minutes = String(liveTime.getMinutes()).padStart(2, '0');
    const seconds = String(liveTime.getSeconds()).padStart(2, '0');
    const dayOfWeek = russianShortDays[liveTime.getDay()];
    const fullDate = `${liveTime.getDate()} ${russianMonths[liveTime.getMonth()]}`;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-5 overflow-y-auto animate-fade-in">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {renderDesktopIcon(activeDesktop.icon, 'w-4 h-4')}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{activeDesktop.name}</h2>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Экран активен (Standby)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsStandbyMode(false)}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>

        {/* Ambient Big Desk Clock Header */}
        <div className="py-6 text-center space-y-1">
          <span className="text-xs font-bold text-white/60 tracking-widest uppercase">
            {dayOfWeek}, {fullDate}
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <h1 className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white">
              {hours}:{minutes}
            </h1>
            <span className="text-2xl font-bold font-mono text-white/50">{seconds}</span>
          </div>
        </div>

        {/* Widgets on Desktop */}
        <div className="flex-1 space-y-3 pb-6">
          {activeWidgets.length > 0 ? (
            activeWidgets.map((w, idx) => (
              <div key={w.id} className="w-full">
                {renderWidgetByConfig(w, idx)}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-white/40 text-xs">
              На этом столе пока нет виджетов. Выйдите из Standby режима, чтобы настроить их.
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="text-center pt-2 border-t border-white/10 text-[10px] text-white/40">
          Настольный режим • Экран не гаснет во время вашей работы
        </div>
      </div>
    );
  }

  /* ==========================================
     EMPTY STATE: NO DESKTOPS CREATED YET
     ========================================== */
  if (customDesktops.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Intro Card */}
        <div className="p-6 rounded-3xl bg-linear-to-br from-[#203A5F] to-[#14233a] text-white shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Персонализированные рабочие столы</h2>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Создайте отдельные пространства под разные сферы жизни — например, один стол для работы (задачи + часы), другой для здоровья (витамины + вода).
            </p>
          </div>
          <button
            onClick={() => setIsManageDesktopsOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-white text-[#203A5F] font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать первый рабочий стол</span>
          </button>
        </div>

        {/* Feature Explanations */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Фильтр по категориям</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Отображайте на столе только рабочие или личные задачи.
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MonitorPlay className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Режим ожидания</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Включите стол на фоне во время работы — экран не будет гаснуть.
            </p>
          </div>
        </div>

        {/* Modal for Desktops Management */}
        <ManageDesktopsModal
          isOpen={isManageDesktopsOpen}
          onClose={() => setIsManageDesktopsOpen(false)}
          customDesktops={customDesktops}
          activeDesktopId={activeCustomDesktopId}
          onSelectDesktop={onSelectDesktop}
          onCreateDesktop={onCreateDesktop}
          onUpdateDesktop={onUpdateDesktop}
          onDeleteDesktop={onDeleteDesktop}
        />
      </div>
    );
  }

  /* ==========================================
     ACTIVE DESKTOP GRID RENDERING
     ========================================== */
  const maxRow = activeWidgets.length > 0 ? Math.max(...activeWidgets.map(w => w.row)) : 0;
  const totalGridRows = isEditing ? Math.max(maxRow + 3, 5) : maxRow + 1;
  const renderedRows: React.ReactNode[] = [];

  for (let r = 0; r < totalGridRows; r++) {
    const rowWidgets = activeWidgets.filter(w => w.row === r);
    if (!isEditing && rowWidgets.length === 0) {
      continue;
    }
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
          style={
            isTargetSlot
              ? { borderColor: globalTheme.primary, backgroundColor: `${globalTheme.primary}15` }
              : undefined
          }
          className={`w-full transition-all relative ${
            isTargetSlot ? 'border-2 scale-[1.02] shadow-inner rounded-3xl' : ''
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
    <div className="space-y-4 animate-fade-in" ref={containerRef}>
      {/* Hidden File Input for Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* iOS-Style Editing Top Toolbar (Like Home Dashboard) OR 2-Row Workspace Controls */}
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
            title="Добавить виджет"
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
        /* Top Workspace Selector & Action Controls (2 Rows) */
        <div className="space-y-2.5">
          {/* Row 1: Actions (Управление столами, Standby, Изменить) */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsManageDesktopsOpen(true)}
              className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Управление рабочими столами"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Управление столами</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStandbyMode(true)}
                className="px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="Включить на фоне (Standby)"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Standby</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                style={{ color: globalTheme.primary }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all hover:bg-slate-200 shadow-2xs cursor-pointer border border-slate-200 shrink-0"
              >
                <span>Изменить</span>
              </button>
            </div>
          </div>

          {/* Row 2: Desktops Selector Chips (below Standby & Изменить) */}
          <div
            ref={desktopBarRef}
            onMouseDown={handleDesktopsMouseDown}
            onMouseMove={handleDesktopsMouseMove}
            onMouseUp={handleDesktopsMouseUpOrLeave}
            onMouseLeave={handleDesktopsMouseUpOrLeave}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none cursor-grab active:cursor-grabbing w-full"
          >
            {customDesktops.map(desk => {
              const isSelected = desk.id === activeDesktop?.id;
              return (
                <button
                  key={desk.id}
                  onClick={() => {
                    if (!hasMovedDesktops.current) {
                      onSelectDesktop(desk.id);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#203A5F] text-white shadow-xs scale-102'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {renderDesktopIcon(desk.icon, 'w-3.5 h-3.5')}
                  <span>{desk.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {desk.widgets.length}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setIsManageDesktopsOpen(true)}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Стол</span>
            </button>
          </div>
        </div>
      )}

      {/* Widgets Grid Matrix */}
      <div className="space-y-3.5 pb-8">
        {renderedRows}
      </div>

      {/* Modals */}
      <ManageDesktopsModal
        isOpen={isManageDesktopsOpen}
        onClose={() => setIsManageDesktopsOpen(false)}
        customDesktops={customDesktops}
        activeDesktopId={activeDesktop?.id}
        onSelectDesktop={onSelectDesktop}
        onCreateDesktop={onCreateDesktop}
        onUpdateDesktop={onUpdateDesktop}
        onDeleteDesktop={onDeleteDesktop}
      />

      <AddDesktopWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWidget={handleAddWidget}
        activeWidgets={rawWidgets}
        taskCategories={appData.taskCategories}
      />
    </div>
  );
};
