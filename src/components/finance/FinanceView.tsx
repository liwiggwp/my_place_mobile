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
  Search,
  PieChart,
  History,
  CreditCard,
  Banknote,
  PiggyBank,
  Landmark,
  ArrowRightLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2
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
  const [activeTab, setActiveTab] = useState<'accounts' | 'history' | 'analytics'>('accounts');
  
  // History Filters
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currency = settings?.currency || '₽';
  const totalBalance = calculateTotalBalance(transactions);
  const monthlyStats = calculateMonthlyStats(transactions, selectedYearMonth, settings);
  const netWorthStats = calculateNetWorth(accounts);
  const debtPayments = getUpcomingDebtPayments(accounts);

  // Group accounts
  const regularAccounts = accounts.filter(a => (a.type === 'card' || a.type === 'cash') && !a.isArchived);
  const savingsAccounts = accounts.filter(a => a.type === 'savings' && !a.isArchived);
  const debtAccounts = accounts.filter(a => (a.type === 'credit_card' || a.type === 'loan' || a.type === 'debt') && !a.isArchived);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedYearMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedYearMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedYearMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Filtered transactions for History Tab
  const filteredTransactions = transactions.filter(t => {
    if (selectedYearMonth && !t.date.startsWith(selectedYearMonth)) return false;
    if (historyTypeFilter !== 'all' && t.type !== historyTypeFilter) return false;
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

  // Nearest upcoming debt payment (if any)
  const nextDebtPayment = debtPayments[0];

  return (
    <div className="space-y-4 pb-16 animate-fade-in text-slate-800">
      
      {/* 1. SIMPLE & CALM HERO CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Month Picker Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Баланс • {monthlyStats.monthName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Предыдущий месяц"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedYearMonth(today.substring(0, 7))}
              className="px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Тек.
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Следующий месяц"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Number: Total Available Funds */}
        <div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {formatCurrency(totalBalance, currency)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
            <span>Расход в этом месяце: <strong className="text-rose-600">-{formatCurrency(monthlyStats.totalExpense, currency)}</strong></span>
            {netWorthStats.totalSavings > 0 && (
              <span>• В заначках: <strong className="text-amber-600">{formatCurrency(netWorthStats.totalSavings, currency)}</strong></span>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border border-rose-200/80 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Minus className="w-3 h-3" />
            </div>
            <span>Расход</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('income')}
            className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] border border-emerald-200/80 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </div>
            <span>Доход</span>
          </button>
        </div>

        {/* Secondary Quick Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => onOpenTransferModal && onOpenTransferModal()}
            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>Перевод / Копилка</span>
          </button>

          <button
            onClick={onOpenBudgetModal}
            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Бюджет: {monthlyStats.budgetUsedPercent}%</span>
          </button>
        </div>
      </div>

      {/* 2. GENTLE UPCOMING PAYMENT ALERT (ONLY IF THERE IS AN ACTIVE DEBT) */}
      {nextDebtPayment && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 truncate">
                Платеж по {nextDebtPayment.account.name}: <span className="text-rose-600">{formatCurrency(nextDebtPayment.paymentAmount, currency)}</span>
              </div>
              <div className="text-[11px] text-amber-800">
                Срок: {nextDebtPayment.dueDay}-е число ({nextDebtPayment.statusLabel})
              </div>
            </div>
          </div>

          {onOpenDebtPayModal && (
            <button
              onClick={() => onOpenDebtPayModal(nextDebtPayment.account)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
            >
              Оплатить
            </button>
          )}
        </div>
      )}

      {/* 3. THREE SIMPLE TABS (Счета, История, Аналитика) */}
      <div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" style={activeTab === 'accounts' ? { color: theme.primary } : undefined} />
          <span>Счета и Заначки</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" style={activeTab === 'history' ? { color: theme.primary } : undefined} />
          <span>История</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4" style={activeTab === 'analytics' ? { color: theme.primary } : undefined} />
          <span>Аналитика</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: СЧЕТА, ЗАНАЧКИ И КРЕДИТЫ                           */}
      {/* ========================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Section 1: Regular Cards & Cash */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Карты и Наличные
              </span>
              <button
                onClick={() => onOpenAddAccount && onOpenAddAccount('card')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + Добавить карту
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regularAccounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => onEditAccount && onEditAccount(acc)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ backgroundColor: acc.color || '#1e293b' }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    >
                      {acc.type === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{acc.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{acc.type === 'cash' ? 'Наличные' : 'Дебетовая карта'}</span>
                    </div>
                  </div>

                  <span className="text-sm font-black text-slate-900 shrink-0">
                    {formatCurrency(acc.balance, acc.currency || currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Savings & Goals (Заначки) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Заначки и Копилки
              </span>
              <button
                onClick={() => onOpenAddAccount && onOpenAddAccount('savings')}
                className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                + Создать заначку
              </button>
            </div>

            {savingsAccounts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                Заначек пока нет. Создайте цель на отпуск или крупную покупку!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savingsAccounts.map(acc => {
                  const target = acc.targetAmount || 0;
                  const progress = target > 0 ? Math.min(100, Math.round((acc.balance / target) * 100)) : 100;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => onEditAccount && onEditAccount(acc)}
                      className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/70 shadow-2xs hover:border-amber-300 space-y-2.5 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: acc.color || '#d97706' }}
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                          >
                            <PiggyBank className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{acc.name}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (onOpenTransferModal) onOpenTransferModal(undefined, acc.id);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          + Пополнить
                        </button>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-black text-slate-900">
                            {formatCurrency(acc.balance, acc.currency || currency)}
                          </span>
                          {target > 0 && (
                            <span className="text-[10px] text-slate-500">
                              из {formatCurrency(target, acc.currency)} ({progress}%)
                            </span>
                          )}
                        </div>

                        {target > 0 && (
                          <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              style={{ width: `${progress}%`, backgroundColor: acc.color || '#d97706' }}
                              className="h-full rounded-full transition-all"
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

          {/* Section 3: Debts & Credits */}
          {debtAccounts.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Кредиты и Кредитные карты
                </span>
                <button
                  onClick={() => onOpenAddAccount && onOpenAddAccount('credit_card')}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  + Добавить
                </button>
              </div>

              <div className="space-y-2">
                {debtAccounts.map(acc => {
                  const isCreditCard = acc.type === 'credit_card';
                  const paymentInfo = debtPayments.find(p => p.account.id === acc.id);

                  return (
                    <div
                      key={acc.id}
                      onClick={() => onEditAccount && onEditAccount(acc)}
                      className="p-3.5 rounded-2xl bg-white border border-rose-200/80 shadow-2xs hover:border-rose-300 space-y-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: acc.color || '#e11d48' }}
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                          >
                            {isCreditCard ? <CreditCard className="w-3.5 h-3.5" /> : <Landmark className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{acc.name}</h4>
                            <span className="text-[10px] text-slate-400 block">
                              Платеж {acc.paymentDueDay || 20}-го числа • {paymentInfo?.statusLabel || 'в графике'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-rose-600 block">
                            -{formatCurrency(acc.balance, acc.currency || currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                        <span>Мин. платеж: <strong className="text-slate-800">{formatCurrency(acc.monthlyPayment || acc.balance, currency)}</strong></span>
                        {onOpenDebtPayModal && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onOpenDebtPayModal(acc);
                            }}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Оплатить →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Create Account Button at Bottom */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onOpenAddAccount && onOpenAddAccount('card')}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать новый счет или заначку</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ИСТОРИЯ ОПЕРАЦИЙ                                   */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* Search and Filters */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по расходам и доходам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 pt-1">
              {[
                { id: 'all', label: 'Все' },
                { id: 'expense', label: 'Расходы' },
                { id: 'income', label: 'Доходы' },
                { id: 'transfer', label: 'Переводы' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setHistoryTypeFilter(f.id as typeof historyTypeFilter)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyTypeFilter === f.id
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Transaction List */}
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2 text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Записей пока нет</p>
              <p className="text-[11px]">Добавьте расход или доход с помощью кнопок выше</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedHistory).map(([dateStr, txList]) => {
                const isToday = dateStr === today;
                return (
                  <div key={dateStr} className="space-y-1.5">
                    <div className="px-2 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>{isToday ? 'Сегодня, ' : ''}{dateStr}</span>
                    </div>

                    <div className="space-y-1 bg-white rounded-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
                      {txList.map(tx => {
                        const meta = getCategoryMeta(tx.category, tx.type === 'transfer' ? 'expense' : tx.type);
                        const isExpense = tx.type === 'expense';
                        const isTransfer = tx.type === 'transfer';

                        return (
                          <div
                            key={tx.id}
                            onClick={() => onEditTransaction(tx)}
                            className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.badgeBg} ${meta.textColor}`}>
                                {isTransfer ? <ArrowRightLeft className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {tx.title || meta.label}
                                </h4>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {meta.label} {tx.account ? `• ${tx.account}` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-black ${isTransfer ? 'text-indigo-600' : isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isTransfer ? '⇄ ' : isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                              </span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm(`Удалить операцию "${tx.title || meta.label}"?`)) {
                                    onDeleteTransaction(tx.id);
                                  }
                                }}
                                className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
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

      {/* ========================================================= */}
      {/* TAB 3: АНАЛИТИКА И БЮДЖЕТ                                 */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-3.5">
          {/* Month selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
              {monthlyStats.monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Budget Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Лимит на месяц
                </span>
                <span className="text-sm font-black text-slate-900">
                  {monthlyStats.budgetLimit > 0
                    ? `${formatCurrency(monthlyStats.totalExpense, currency)} / ${formatCurrency(monthlyStats.budgetLimit, currency)}`
                    : 'Лимит не установлен'}
                </span>
              </div>
              <button
                onClick={onOpenBudgetModal}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {monthlyStats.budgetLimit > 0 ? 'Изменить' : 'Настроить'}
              </button>
            </div>

            {monthlyStats.budgetLimit > 0 && (
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, monthlyStats.budgetUsedPercent)}%`,
                      backgroundColor: monthlyStats.budgetUsedPercent > 100 ? '#e11d48' : theme.primary
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Израсходовано: {Math.round(monthlyStats.budgetUsedPercent)}%</span>
                  <span>Остаток: {formatCurrency(Math.max(0, monthlyStats.budgetRemaining), currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Income vs Expense */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Доходы
              </span>
              <span className="text-sm font-black text-emerald-700 block">
                +{formatCurrency(monthlyStats.totalIncome, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Расходы
              </span>
              <span className="text-sm font-black text-rose-700 block">
                -{formatCurrency(monthlyStats.totalExpense, currency)}
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Расходы по категориям
            </h3>

            {monthlyStats.categoryExpenses.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <PieChart className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs">В этом месяце расходов еще нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyStats.categoryExpenses.map(cat => {
                  const meta = cat.meta || getCategoryMeta(cat.category, 'expense');
                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${meta.badgeBg}`} />
                          {meta.label}
                        </span>
                        <div className="text-right">
                          <span className="font-black text-slate-900 mr-2">
                            {formatCurrency(cat.amount, currency)}
                          </span>
                          <span className="text-slate-400 font-semibold text-[11px]">
                            ({Math.round(cat.percentage)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className="h-full bg-slate-700 rounded-full transition-all duration-300"
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
    </div>
  );
};
