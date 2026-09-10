import React, { useState } from 'react';
import type {
  FinancialTransaction,
  FinancialAccount,
  FinanceSettings,
  DualColorTheme,
  TransactionType,
  AccountType
} from '../../types';
import {
  calculateMonthlyStats,
  calculateTotalBalance,
  calculateTodayStats,
  calculateNetWorth,
  getUpcomingDebtPayments,
  groupTransactionsByDate,
  formatCurrency,
  getCategoryMeta
} from '../../utils/financeUtils';
import { getTodayString } from '../../utils/dateUtils';
import {
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
  CreditCard,
  Banknote,
  PiggyBank,
  Landmark,
  ArrowRightLeft,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  accounts?: FinancialAccount[];
  settings?: FinanceSettings;
  theme?: DualColorTheme;
  onOpenAddTransaction: (type: TransactionType) => void;
  onEditTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenBudgetModal: () => void;
  onOpenAddAccount?: (type?: AccountType) => void;
  onEditAccount?: (acc: FinancialAccount) => void;
  onDeleteAccount?: (id: string) => void;
  onOpenTransferModal?: (fromId?: string, toId?: string) => void;
  onOpenDebtPayModal?: (debtAccount: FinancialAccount) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions = [],
  accounts = [],
  settings,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenBudgetModal,
  onOpenAddAccount,
  onEditAccount,
  onOpenTransferModal,
  onOpenDebtPayModal
}) => {
  const today = getTodayString();
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(today.substring(0, 7));
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'accounts' | 'debts' | 'categories' | 'history' | 'analytics'>('overview');
  
  // History Filters
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [historyAccountFilter, setHistoryAccountFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currency = settings?.currency || '₽';
  const totalBalance = calculateTotalBalance(transactions);
  const monthlyStats = calculateMonthlyStats(transactions, selectedYearMonth, settings);
  const todayStats = calculateTodayStats(transactions, today);
  const netWorthStats = calculateNetWorth(accounts);
  const debtPayments = getUpcomingDebtPayments(accounts);

  // Split accounts by type
  const regularAccounts = accounts.filter(a => (a.type === 'card' || a.type === 'cash') && !a.isArchived);
  const savingsAccounts = accounts.filter(a => a.type === 'savings' && !a.isArchived);
  const debtAccounts = accounts.filter(a => (a.type === 'credit_card' || a.type === 'loan' || a.type === 'debt') && !a.isArchived);

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
    if (historyAccountFilter !== 'all' && t.accountId !== historyAccountFilter && t.account !== historyAccountFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = getCategoryMeta(t.category, t.type === 'transfer' ? 'expense' : t.type);
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
      {/* Top Hero Balance & Net Worth Card */}
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

        {/* Balance & Net Worth Display */}
        <div className="relative z-10 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/75">Чистый капитал (Активы - Долги)</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                {formatCurrency(netWorthStats.netWorth || totalBalance, currency)}
              </h2>
            </div>

            {netWorthStats.totalDebts > 0 && (
              <div className="text-right bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                <span className="text-[10px] text-rose-200 font-bold block">Долги по кредитам</span>
                <span className="text-xs sm:text-sm font-black text-rose-200">
                  -{formatCurrency(netWorthStats.totalDebts, currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Pillars: Cards/Cash, Stashes, Debts */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
            <span className="text-[10px] text-white/80 font-semibold block">На картах/наличные</span>
            <span className="text-xs sm:text-sm font-black text-white block truncate">
              {formatCurrency(netWorthStats.totalAssets - netWorthStats.totalSavings, currency)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
            <span className="text-[10px] text-amber-200 font-semibold block">В заначках</span>
            <span className="text-xs sm:text-sm font-black text-amber-200 block truncate">
              {formatCurrency(netWorthStats.totalSavings, currency)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
            <span className="text-[10px] text-white/80 font-semibold block">Расходы в мес.</span>
            <span className="text-xs sm:text-sm font-black text-rose-200 block truncate">
              -{formatCurrency(monthlyStats.totalExpense, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* UPCOMING DEBT PAYMENTS ALERT BANNER (IF ANY DEBT PAYMENTS) */}
      {debtPayments.length > 0 && (
        <div className="p-4 rounded-3xl bg-linear-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-200 shadow-xs space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Ближайшие платежи по кредитам</h3>
                <p className="text-[10px] text-slate-500">Контроль дат и обязательных взносов</p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('debts')}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Все долги ({debtPayments.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {debtPayments.slice(0, 2).map(pay => (
              <div
                key={pay.account.id}
                className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pay.status === 'urgent' || pay.status === 'today' || pay.status === 'overdue'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-800 truncate">{pay.account.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Срок: <strong>{pay.dueDay}-е число</strong> ({pay.statusLabel})
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-rose-600 block">
                    {formatCurrency(pay.paymentAmount, pay.account.currency || currency)}
                  </span>
                  {onOpenDebtPayModal && (
                    <button
                      type="button"
                      onClick={() => onOpenDebtPayModal(pay.account)}
                      className="mt-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] active:scale-95 transition-all cursor-pointer border border-rose-200"
                    >
                      Оплатить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onOpenAddTransaction('expense')}
          className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Minus className="w-3 h-3" />
          </div>
          <span>+ Расход</span>
        </button>

        <button
          onClick={() => onOpenAddTransaction('income')}
          className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Plus className="w-3 h-3" />
          </div>
          <span>+ Доход</span>
        </button>

        <button
          onClick={() => onOpenTransferModal && onOpenTransferModal()}
          className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
          <span>Перевод</span>
        </button>

        <button
          onClick={() => onOpenAddAccount && onOpenAddAccount()}
          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-slate-500" />
          <span>+ Счет/Заначка</span>
        </button>
      </div>

      {/* Sub-View Navigation Switcher (6 tabs) */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
          { id: 'accounts', label: 'Счета & Заначки', icon: PiggyBank },
          { id: 'debts', label: 'Кредиты & Долги', icon: Landmark },
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
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
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
          {/* Monthly Budget Progress Card */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3 md:col-span-2">
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

              <div className="flex items-center gap-2">
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
                <button
                  onClick={onOpenBudgetModal}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Настроить бюджет"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
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

          {/* Accounts & Stashes Quick Preview */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Мои счета и заначки
              </h3>
              <button
                onClick={() => setActiveSubTab('accounts')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Все счета ({accounts.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {accounts.slice(0, 4).map(acc => {
                const isDebt = acc.type === 'credit_card' || acc.type === 'loan';
                const isSavings = acc.type === 'savings';
                return (
                  <div
                    key={acc.id}
                    onClick={() => onEditAccount && onEditAccount(acc)}
                    className="p-2.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/70 flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: acc.color || '#1e293b' }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      >
                        {isSavings ? (
                          <PiggyBank className="w-4 h-4" />
                        ) : isDebt ? (
                          <Landmark className="w-4 h-4" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{acc.name}</h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {isSavings && acc.targetAmount ? `Цель: ${formatCurrency(acc.targetAmount, acc.currency)}` : acc.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black ${isDebt ? 'text-rose-600' : 'text-slate-800'}`}>
                        {isDebt ? '-' : ''}{formatCurrency(acc.balance, acc.currency || currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyStats.categoryExpenses.slice(0, 4).map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${cat.meta.color}`} />
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ACCOUNTS & STASHES */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800">Карты, Кошельки и Заначки</h3>
              <p className="text-xs text-slate-500">Управляйте своими балансами и копилками</p>
            </div>

            <button
              onClick={() => onOpenAddAccount && onOpenAddAccount('savings')}
              style={{ backgroundColor: theme.primary }}
              className="py-2 px-3.5 rounded-2xl text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать копилку / счет</span>
            </button>
          </div>

          {/* Section 1: Regular Accounts & Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Повседневные счета и наличные</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {regularAccounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => onEditAccount && onEditAccount(acc)}
                  className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[110px] active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden group hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: acc.color || '#1e293b' }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
                      >
                        {acc.type === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-800">{acc.name}</h5>
                        <span className="text-[10px] text-slate-400 capitalize">{acc.type === 'cash' ? 'Наличные' : 'Дебетовая карта'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (onOpenTransferModal) onOpenTransferModal(acc.id);
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Перевести со счета"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <span className="text-xl font-black text-slate-800">
                      {formatCurrency(acc.balance, acc.currency || currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Stashes & Piggy Banks (Заначки и Копилки с целями) */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
              <span>Заначки, Копилки и Накопления</span>
            </h4>

            {savingsAccounts.length === 0 ? (
              <div className="p-6 rounded-3xl glass-card border border-slate-200 text-center space-y-2 text-slate-400">
                <PiggyBank className="w-8 h-8 mx-auto text-amber-400" />
                <p className="text-xs font-bold text-slate-700">У вас пока нет отдельных заначек</p>
                <p className="text-[11px] text-slate-500">Создайте заначку на отпуск, новый телефон или подушку безопасности!</p>
                <button
                  onClick={() => onOpenAddAccount && onOpenAddAccount('savings')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all cursor-pointer shadow-xs"
                >
                  + Создать первую заначку
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savingsAccounts.map(acc => {
                  const target = acc.targetAmount || 0;
                  const progress = target > 0 ? Math.min(100, Math.round((acc.balance / target) * 100)) : 100;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => onEditAccount && onEditAccount(acc)}
                      className="p-4 rounded-3xl bg-linear-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/80 shadow-xs flex flex-col justify-between min-h-[130px] active:scale-[0.99] transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            style={{ backgroundColor: acc.color || '#d97706' }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
                          >
                            <PiggyBank className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-extrabold text-slate-800">{acc.name}</h5>
                            <span className="text-[10px] text-amber-700 font-bold">
                              {target > 0 ? `Цель: ${formatCurrency(target, acc.currency)} (${progress}%)` : 'Бессрочная заначка'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (onOpenTransferModal) onOpenTransferModal(undefined, acc.id);
                          }}
                          className="px-2 py-1 rounded-xl bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600 transition-all"
                          title="Пополнить заначку"
                        >
                          + Пополнить
                        </button>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-black text-slate-900">
                            {formatCurrency(acc.balance, acc.currency || currency)}
                          </span>
                          {target > 0 && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Осталось {formatCurrency(Math.max(0, target - acc.balance), acc.currency)}
                            </span>
                          )}
                        </div>

                        {target > 0 && (
                          <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progress}%`, backgroundColor: acc.color || '#d97706' }}
                              className="h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DEBTS & CREDITS (Кредиты, Кредитки, Рассрочки, Когда и сколько платить) */}
      {activeSubTab === 'debts' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800">Кредиты, Кредитные карты и Долги</h3>
              <p className="text-xs text-slate-500">График обязательных платежей и контроль долгов</p>
            </div>

            <button
              onClick={() => onOpenAddAccount && onOpenAddAccount('credit_card')}
              className="py-2 px-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить кредит / карту</span>
            </button>
          </div>

          {/* Debt Summary Banner */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-rose-500 to-rose-700 text-white shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-100 block">Общий долг по всем кредитам</span>
              <span className="text-2xl sm:text-3xl font-black block mt-0.5">
                {formatCurrency(netWorthStats.totalDebts, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-rose-100 block">Платежей в этом месяце</span>
              <span className="text-base sm:text-lg font-black block mt-0.5">
                {formatCurrency(
                  debtPayments.reduce((sum, p) => sum + p.paymentAmount, 0),
                  currency
                )}
              </span>
            </div>
          </div>

          {/* Debt Items List */}
          {debtAccounts.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card border border-slate-200 text-center space-y-2 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="text-xs font-bold text-slate-700">У вас нет активных кредитов и долгов!</p>
              <p className="text-[11px] text-slate-500">Отличный результат финансовой свободы.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debtAccounts.map(acc => {
                const isCreditCard = acc.type === 'credit_card';
                const limit = acc.creditLimit || 0;
                const usedPercent = limit > 0 ? Math.min(100, Math.round((acc.balance / limit) * 100)) : 100;
                const duePayment = debtPayments.find(p => p.account.id === acc.id);

                return (
                  <div
                    key={acc.id}
                    onClick={() => onEditAccount && onEditAccount(acc)}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-200/80 shadow-xs space-y-3 active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: acc.color || '#e11d48' }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
                        >
                          {isCreditCard ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">{acc.name}</h4>
                          <span className="text-[11px] text-slate-500 block">
                            {isCreditCard ? `Кредитка • лимит ${formatCurrency(limit, acc.currency)}` : `Кредит/Рассрочка • ${acc.interestRate ? `${acc.interestRate}%` : '0%'}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black text-rose-600 block">
                          -{formatCurrency(acc.balance, acc.currency || currency)}
                        </span>
                        <span className="text-[10px] text-slate-400">текущий долг</span>
                      </div>
                    </div>

                    {/* Due Date & Monthly Payment Alert */}
                    <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <span className="font-bold text-rose-900 block">
                            Платеж: {formatCurrency(acc.monthlyPayment || acc.balance, acc.currency || currency)}
                          </span>
                          <span className="text-[10px] text-rose-700">
                            Срок: <strong>{acc.paymentDueDay || 20}-е число каждого месяца</strong> ({duePayment?.statusLabel || 'в графике'})
                          </span>
                        </div>
                      </div>

                      {onOpenDebtPayModal && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onOpenDebtPayModal(acc);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                        >
                          Погасить
                        </button>
                      )}
                    </div>

                    {/* Credit Limit Usage Progress */}
                    {limit > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Использовано: {usedPercent}% лимита</span>
                          <span>Свободно: {formatCurrency(Math.max(0, limit - acc.balance), acc.currency)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${usedPercent}%` }}
                            className="h-full bg-rose-500 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: CATEGORIES */}
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
                {monthlyStats.categoryExpenses.map(cat => (
                  <div
                    key={cat.category}
                    onClick={() => {
                      setHistoryCategoryFilter(cat.category);
                      setActiveSubTab('history');
                    }}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 space-y-1.5 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{cat.meta.label}</span>
                        <span className="text-[10px] text-slate-400 block">{cat.count} опер.</span>
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
                ))}
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
                {monthlyStats.categoryIncomes.map(cat => (
                  <div
                    key={cat.category}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{cat.meta.label}</span>
                        <span className="text-[10px] text-slate-400 block">{cat.count} опер.</span>
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {/* Search & Filter Bar */}
          <div className="p-3 rounded-2xl glass-card border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по названию, категории или счету..."
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
                  { id: 'income', label: 'Доходы' },
                  { id: 'transfer', label: 'Переводы' }
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

              {/* Reset Filters */}
              {(historyCategoryFilter !== 'all' || historyAccountFilter !== 'all') && (
                <button
                  onClick={() => {
                    setHistoryCategoryFilter('all');
                    setHistoryAccountFilter('all');
                  }}
                  className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 cursor-pointer"
                >
                  Сбросить фильтры ✕
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
                        const meta = getCategoryMeta(tx.category, tx.type === 'transfer' ? 'expense' : tx.type);
                        const isExpense = tx.type === 'expense';
                        const isTransfer = tx.type === 'transfer';

                        return (
                          <div
                            key={tx.id}
                            onClick={() => onEditTransaction(tx)}
                            className="p-3 rounded-2xl glass-card hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.badgeBg} ${meta.textColor}`}>
                                {isTransfer ? <ArrowRightLeft className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {tx.title || (isTransfer ? 'Перевод между счетами' : meta.label)}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {meta.label} {tx.account ? `• ${tx.account}` : ''} {tx.time ? `• ${tx.time}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <span className={`text-sm font-black ${isTransfer ? 'text-indigo-600' : isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {isTransfer ? '⇄ ' : isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
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

      {/* SUB-VIEW 6: ANALYTICS */}
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

          {/* Debt & Credit Advice */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <span>Контроль долгов и кредиток</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 space-y-1">
                <span className="font-bold block">💳 Льготный период кредиток</span>
                <p className="text-[11px] text-rose-700">
                  Погашайте полную сумму задолженности до даты платежа, чтобы не платить банковские проценты.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">🌴 Копилки и заначки</span>
                <p className="text-[11px] text-emerald-700">
                  Регулярный перевод даже 10% от любого дохода в заначку формирует надежную подушку безопасности за 3-6 месяцев!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
