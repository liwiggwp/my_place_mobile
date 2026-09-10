import React, { useState } from 'react';
import type { FinancialTransaction, FinanceSettings, DualColorTheme, TransactionType } from '../../types';
import {
  calculateMonthlyStats,
  calculateTotalBalance,
  calculateTodayStats,
  groupTransactionsByDate,
  formatCurrency,
  getCategoryMeta
} from '../../utils/financeUtils';
import { getTodayString } from '../../utils/dateUtils';
import {
  TrendingUp,
  Plus,
  Minus,
  Sliders,
  Calendar,
  Search,
  PieChart,
  History,
  LayoutDashboard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Tag,
  HeartPulse,
  Film,
  Smartphone,
  Gift,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Percent,
  PlusCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  settings?: FinanceSettings;
  theme?: DualColorTheme;
  onOpenAddTransaction: (type: TransactionType) => void;
  onEditTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenBudgetModal: () => void;
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

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions = [],
  settings,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenBudgetModal
}) => {
  const today = getTodayString();
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(today.substring(0, 7));
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'categories' | 'history' | 'analytics'>('overview');
  
  // History Filters
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currency = settings?.currency || '₽';
  const totalBalance = calculateTotalBalance(transactions);
  const monthlyStats = calculateMonthlyStats(transactions, selectedYearMonth, settings);
  const todayStats = calculateTodayStats(transactions, today);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedYearMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedYearMonth(`${newY}-${newM}`);
  };

  // Filtered transactions for History Tab
  const filteredTransactions = transactions.filter(t => {
    if (selectedYearMonth && !t.date.startsWith(selectedYearMonth)) return false;
    if (historyTypeFilter !== 'all' && t.type !== historyTypeFilter) return false;
    if (historyCategoryFilter !== 'all' && t.category !== historyCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = getCategoryMeta(t.category, t.type);
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchCat = meta.label.toLowerCase().includes(q);
      const matchAcc = (t.account || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchAcc) return false;
    }
    return true;
  });

  const groupedHistory = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Top Hero Balance & Month Selector Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
        }}
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-slate-200/50"
      >
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        {/* Month Selector Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
              {monthlyStats.monthName}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-xl hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title="Предыдущий месяц"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setSelectedYearMonth(today.substring(0, 7))}
              className="px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
            >
              Тек.
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-xl hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title="Следующий месяц"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Balance Stats */}
        <div className="relative z-10 pt-4 pb-2">
          <p className="text-xs font-medium text-white/75">Общий накопительный баланс</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(totalBalance, currency)}
            </h2>
          </div>
        </div>

        {/* Income vs Expense Pills */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              <span>Доходы за месяц</span>
            </div>
            <p className="text-base sm:text-lg font-black text-white">
              {formatCurrency(monthlyStats.totalIncome, currency, true)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>Расходы за месяц</span>
            </div>
            <p className="text-base sm:text-lg font-black text-white">
              -{formatCurrency(monthlyStats.totalExpense, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Budget Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => onOpenAddTransaction('expense')}
          className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Minus className="w-3.5 h-3.5" />
          </div>
          <span>+ Расход</span>
        </button>

        <button
          onClick={() => onOpenAddTransaction('income')}
          className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>+ Доход</span>
        </button>

        <button
          onClick={onOpenBudgetModal}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-slate-500" />
          <span>Бюджет трат</span>
        </button>
      </div>

      {/* Monthly Budget Progress Card */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              className="p-1.5 rounded-xl"
            >
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Бюджет месяца</h3>
              <p className="text-[10px] text-[#595959]">
                Потрачено {monthlyStats.budgetUsedPercent}% из {formatCurrency(monthlyStats.budgetLimit, currency)}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              monthlyStats.budgetUsedPercent >= 100
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : monthlyStats.budgetUsedPercent >= 80
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {monthlyStats.budgetRemaining > 0
              ? `Осталось ${formatCurrency(monthlyStats.budgetRemaining, currency)}`
              : 'Лимит превышен!'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
          <div
            style={{
              width: `${Math.min(100, monthlyStats.budgetUsedPercent)}%`,
              backgroundColor:
                monthlyStats.budgetUsedPercent >= 100
                  ? '#f43f5e'
                  : monthlyStats.budgetUsedPercent >= 80
                  ? '#f59e0b'
                  : theme.primary
            }}
            className="h-full rounded-full transition-all duration-500"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#595959] pt-0.5">
          <span>Ср. расход в день: <strong className="text-slate-800">{formatCurrency(monthlyStats.dailyAverageExpense, currency)}</strong></span>
          <span>Сегодня: <strong className="text-rose-600">-{formatCurrency(todayStats.todayExpense, currency)}</strong></span>
        </div>
      </div>

      {/* Sub-View Navigation Switcher */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl gap-1">
        {[
          { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
          { id: 'categories', label: 'Категории', icon: PieChart },
          { id: 'history', label: 'История', icon: History },
          { id: 'analytics', label: 'Аналитика', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-800 shadow-xs scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={isActive ? { color: theme.primary } : undefined} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 animate-fade-in">
          {/* Top Spending Categories */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Главные расходы месяца
              </h3>
              <button
                onClick={() => setActiveSubTab('categories')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Все категории →
              </button>
            </div>

            {monthlyStats.categoryExpenses.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <PieChart className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">В этом месяце расходов пока нет</p>
                <button
                  onClick={() => onOpenAddTransaction('expense')}
                  className="text-xs font-bold text-indigo-600 hover:underline pt-1 cursor-pointer"
                >
                  + Записать первый расход
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyStats.categoryExpenses.slice(0, 4).map(cat => {
                  const Icon = CATEGORY_ICON_MAP[cat.meta.icon] || Tag;
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cat.meta.badgeBg} ${cat.meta.textColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-700 truncate">{cat.meta.label}</span>
                          <span className="text-[10px] text-slate-400">({cat.percentage}%)</span>
                        </div>
                        <span className="font-black text-slate-800">{formatCurrency(cat.amount, currency)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full rounded-full ${cat.meta.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions in Overview */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Последние операции
              </h3>
              <button
                onClick={() => setActiveSubTab('history')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Вся история →
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Операций пока нет</p>
                <p className="text-[11px] text-slate-400">Нажмите «+ Расход» или «+ Доход» выше</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map(tx => {
                  const meta = getCategoryMeta(tx.category, tx.type);
                  const Icon = CATEGORY_ICON_MAP[meta.icon] || Tag;
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="p-2.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/70 flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.badgeBg} ${meta.textColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {tx.title || meta.label}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {meta.label} • {tx.date.substring(5)} {tx.time ? `• ${tx.time}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-black ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CATEGORIES */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 animate-fade-in">
          {/* Expenses by Category */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Расходы по статьям ({formatCurrency(monthlyStats.totalExpense, currency)})</span>
            </h3>

            {monthlyStats.categoryExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Расходов в этом месяце нет</p>
            ) : (
              <div className="space-y-3">
                {monthlyStats.categoryExpenses.map(cat => {
                  const Icon = CATEGORY_ICON_MAP[cat.meta.icon] || Tag;
                  return (
                    <div
                      key={cat.category}
                      onClick={() => {
                        setHistoryCategoryFilter(cat.category);
                        setActiveSubTab('history');
                      }}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 space-y-1.5 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${cat.meta.badgeBg} ${cat.meta.textColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{cat.meta.label}</span>
                            <span className="text-[10px] text-slate-400 block">{cat.count} опер.</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 block">{formatCurrency(cat.amount, currency)}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full rounded-full ${cat.meta.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incomes by Category */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Источники дохода ({formatCurrency(monthlyStats.totalIncome, currency)})</span>
            </h3>

            {monthlyStats.categoryIncomes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Доходов в этом месяце нет</p>
            ) : (
              <div className="space-y-3">
                {monthlyStats.categoryIncomes.map(cat => {
                  const Icon = CATEGORY_ICON_MAP[cat.meta.icon] || Tag;
                  return (
                    <div
                      key={cat.category}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${cat.meta.badgeBg} ${cat.meta.textColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{cat.meta.label}</span>
                            <span className="text-[10px] text-slate-400 block">{cat.count} опер.</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 block">+{formatCurrency(cat.amount, currency)}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {/* Search & Filter Bar */}
          <div className="p-3 rounded-2xl glass-card border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по названию или категории..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'expense', label: 'Расходы' },
                  { id: 'income', label: 'Доходы' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryTypeFilter(f.id as typeof historyTypeFilter)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      historyTypeFilter === f.id
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Reset Category Filter if set */}
              {historyCategoryFilter !== 'all' && (
                <button
                  onClick={() => setHistoryCategoryFilter('all')}
                  className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 cursor-pointer"
                >
                  Сбросить категорию ✕
                </button>
              )}
            </div>
          </div>

          {/* Grouped Transaction List */}
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="p-8 text-center glass-card rounded-3xl border border-slate-200 space-y-2 text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Записи не найдены</p>
              <p className="text-[11px]">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedHistory).map(([dateStr, txList]) => {
                const isToday = dateStr === today;
                const dayTotalExpense = txList
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
                const dayTotalIncome = txList
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

                return (
                  <div key={dateStr} className="space-y-1.5">
                    {/* Date Header Row */}
                    <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={isToday ? 'text-indigo-600 font-extrabold' : ''}>
                          {isToday ? 'Сегодня, ' : ''}{dateStr}
                        </span>
                      </span>

                      <div className="flex items-center gap-2 text-[10px]">
                        {dayTotalExpense > 0 && <span className="text-rose-600 font-bold">-{formatCurrency(dayTotalExpense, currency)}</span>}
                        {dayTotalIncome > 0 && <span className="text-emerald-600 font-bold">+{formatCurrency(dayTotalIncome, currency)}</span>}
                      </div>
                    </div>

                    {/* Day Transaction Cards */}
                    <div className="space-y-1.5">
                      {txList.map(tx => {
                        const meta = getCategoryMeta(tx.category, tx.type);
                        const Icon = CATEGORY_ICON_MAP[meta.icon] || Tag;
                        const isExpense = tx.type === 'expense';

                        return (
                          <div
                            key={tx.id}
                            onClick={() => onEditTransaction(tx)}
                            className="p-3 rounded-2xl glass-card hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.badgeBg} ${meta.textColor}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {tx.title || meta.label}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {meta.label} {tx.account ? `• ${tx.account}` : ''} {tx.time ? `• ${tx.time}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <span className={`text-sm font-black ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm(`Удалить операцию "${tx.title || meta.label}"?`)) {
                                    onDeleteTransaction(tx.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 animate-fade-in">
          {/* Savings Rate & Health */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Норма накоплений</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <p className="text-xs font-medium text-slate-500">Доля сохраненных средств за месяц</p>
              <div className="text-3xl font-black text-slate-800">
                {monthlyStats.savingsRate}%
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">
                {monthlyStats.netSavings >= 0 ? `+${formatCurrency(monthlyStats.netSavings, currency)} сохранено` : 'Дефицит бюджета'}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>Всего операций за месяц:</span>
                <strong className="text-slate-800">{monthlyStats.transactionCount}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Средний расход в день:</span>
                <strong className="text-slate-800">{formatCurrency(monthlyStats.dailyAverageExpense, currency)}</strong>
              </div>
            </div>
          </div>

          {/* Budget Advice */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <span>Финансовые подсказки</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold block">💡 Правило 50/30/20</span>
                <p className="text-[11px] text-indigo-700">
                  Старайтесь направлять 50% доходов на обязательные нужды (продукты, жилье), 30% на радости и 20% в накопления.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">💧 Водный баланс & Кофе</span>
                <p className="text-[11px] text-emerald-700">
                  Замена одной чашки покупного кофе на стакан воды экономит до 6 000 ₽ в месяц и улучшает самочувствие!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
