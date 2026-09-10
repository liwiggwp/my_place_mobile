import React from 'react';
import type { AppData, DualColorTheme, WidgetConfig } from '../../types';
import {
  calculateMonthlyStats,
  calculateTotalBalance,
  calculateTodayStats,
  formatCurrency,
  getCategoryMeta
} from '../../utils/financeUtils';
import {
  Wallet,
  TrendingUp,
  Plus,
  Minus,
  ChevronRight,
  Tag,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  HeartPulse,
  Film,
  Smartphone,
  Gift,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Percent,
  PlusCircle,
  Sparkles
} from 'lucide-react';

export interface FinanceWidgetProps {
  widget: WidgetConfig;
  appData: AppData;
  isEditing?: boolean;
  theme?: DualColorTheme;
  onNavigate: () => void;
  onQuickAddExpense?: () => void;
  onQuickAddIncome?: () => void;
  renderEditControls?: (widget: WidgetConfig) => React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  dragStyle?: React.CSSProperties;
  jiggleClass?: string;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Tag,
  HeartPulse,
  Film,
  Smartphone,
  Sparkles,
  Gift,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Percent,
  PlusCircle
};

export const FinanceWidget: React.FC<FinanceWidgetProps> = ({
  widget,
  appData,
  isEditing = false,
  theme,
  onNavigate,
  onQuickAddExpense,
  onQuickAddIncome,
  renderEditControls,
  onPointerDown,
  onPointerUp,
  dragStyle = {},
  jiggleClass = ''
}) => {
  const size = widget.size || 'medium';
  const transactions = appData.transactions || [];
  const settings = appData.financeSettings;
  const currency = settings?.currency || '₽';

  const totalBalance = calculateTotalBalance(transactions);
  const monthlyStats = calculateMonthlyStats(transactions, undefined, settings);
  const todayStats = calculateTodayStats(transactions);

  const primaryColor = theme?.primary || appData.themeSettings?.finance?.primary || '#059669';
  const secondaryColor = theme?.secondary || appData.themeSettings?.finance?.secondary || '#065f46';

  const cardGradientStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    ...dragStyle
  };

  // 1. SMALL WIDGET (2x2)
  if (size === 'small') {
    return (
      <div
        data-widget-id={widget.id}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={() => !isEditing && onNavigate()}
        style={cardGradientStyle}
        className={`relative p-3.5 sm:p-4 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow flex flex-col justify-between min-h-[160px] h-full select-none ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls && renderEditControls(widget)}

        <div className="flex items-center justify-between pointer-events-none min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
            {currency} Баланс
          </span>
        </div>

        <div className="my-1 pointer-events-none min-w-0">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight truncate">
            {formatCurrency(totalBalance, currency)}
          </h3>
          <p className="text-[11px] text-white/80 font-medium">общий баланс</p>
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/90 pointer-events-none">
          <span className="truncate pr-1">
            {todayStats.todayExpense > 0 ? `Сегодня: -${formatCurrency(todayStats.todayExpense, currency)}` : 'Бюджет в норме'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </div>
      </div>
    );
  }

  // 2. MEDIUM WIDGET (2x4 / full width)
  if (size === 'medium') {
    return (
      <div
        data-widget-id={widget.id}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={() => !isEditing && onNavigate()}
        style={cardGradientStyle}
        className={`relative p-4 sm:p-5 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none space-y-3 ${
          isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
        } ${jiggleClass}`}
      >
        {renderEditControls && renderEditControls(widget)}

        {/* Header */}
        <div className="flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white/90 block leading-tight">Финансы & Бюджет</span>
              <span className="text-[10px] text-white/70">{monthlyStats.monthName}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-black block leading-tight">
              {formatCurrency(totalBalance, currency)}
            </span>
            <span className="text-[10px] text-white/75">Текущий баланс</span>
          </div>
        </div>

        {/* Budget bar */}
        <div className="space-y-1 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>Расход: -{formatCurrency(monthlyStats.totalExpense, currency)}</span>
            <span>{monthlyStats.budgetUsedPercent}% из {formatCurrency(monthlyStats.budgetLimit, currency)}</span>
          </div>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${Math.min(100, monthlyStats.budgetUsedPercent)}%` }}
              className={`h-full rounded-full transition-all ${
                monthlyStats.budgetUsedPercent >= 100
                  ? 'bg-rose-400'
                  : monthlyStats.budgetUsedPercent >= 80
                  ? 'bg-amber-300'
                  : 'bg-white'
              }`}
            />
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (!isEditing && onQuickAddExpense) onQuickAddExpense();
                else if (!isEditing) onNavigate();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-[11px] font-bold text-white flex items-center gap-1 transition-all cursor-pointer backdrop-blur-xs border border-white/20"
            >
              <Minus className="w-3 h-3 text-rose-200" />
              <span>Расход</span>
            </button>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (!isEditing && onQuickAddIncome) onQuickAddIncome();
                else if (!isEditing) onNavigate();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-[11px] font-bold text-white flex items-center gap-1 transition-all cursor-pointer backdrop-blur-xs border border-white/20"
            >
              <Plus className="w-3 h-3 text-emerald-200" />
              <span>Доход</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1 pointer-events-none">
            <span>Открыть</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // 3. LARGE WIDGET (4x4)
  return (
    <div
      data-widget-id={widget.id}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={() => !isEditing && onNavigate()}
      style={cardGradientStyle}
      className={`relative p-5 sm:p-6 rounded-3xl text-white shadow-md cursor-pointer active:scale-[0.98] transition-shadow select-none space-y-4 ${
        isEditing ? 'touch-none cursor-grab active:cursor-grabbing overflow-visible' : 'overflow-hidden'
      } ${jiggleClass}`}
    >
      {renderEditControls && renderEditControls(widget)}

      {/* Top Row */}
      <div className="flex items-start justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90">Финансы и Бюджет</h3>
              <p className="text-[11px] text-white/70">{monthlyStats.monthName}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black block leading-tight">
            {formatCurrency(totalBalance, currency)}
          </span>
          <span className="text-[10px] font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
            {monthlyStats.savingsRate}% сохранено
          </span>
        </div>
      </div>

      {/* Income vs Expense Pills */}
      <div className="grid grid-cols-2 gap-2 pointer-events-none">
        <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20">
          <span className="text-[10px] text-emerald-200 font-bold block">Доходы за месяц</span>
          <span className="text-sm font-black text-white block">
            {formatCurrency(monthlyStats.totalIncome, currency, true)}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20">
          <span className="text-[10px] text-rose-200 font-bold block">Расходы за месяц</span>
          <span className="text-sm font-black text-white block">
            -{formatCurrency(monthlyStats.totalExpense, currency)}
          </span>
        </div>
      </div>

      {/* Monthly Budget Progress */}
      <div className="space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-between text-xs text-white/90 font-medium">
          <span>Бюджет: {monthlyStats.budgetUsedPercent}%</span>
          <span>Остаток: {formatCurrency(monthlyStats.budgetRemaining, currency)}</span>
        </div>
        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, monthlyStats.budgetUsedPercent)}%` }}
            className="h-full bg-white rounded-full transition-all"
          />
        </div>
      </div>

      {/* Recent 3 transactions */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider pointer-events-none">
          Последние операции
        </p>
        {transactions.length === 0 ? (
          <p className="text-xs text-white/70 py-2 pointer-events-none">Операций пока нет</p>
        ) : (
          transactions.slice(0, 3).map(tx => {
            const meta = getCategoryMeta(tx.category, tx.type);
            const Icon = CATEGORY_ICON_MAP[meta.icon] || Tag;
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/10 backdrop-blur-xs text-xs pointer-events-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold truncate">{tx.title || meta.label}</span>
                </div>
                <span className={`font-black shrink-0 ${isExpense ? 'text-rose-200' : 'text-emerald-200'}`}>
                  {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-white/20 flex items-center justify-between pointer-events-none">
        <span className="text-xs font-bold text-white/90">Управление доходами и расходами →</span>
        <ChevronRight className="w-4 h-4 text-white/80" />
      </div>
    </div>
  );
};
