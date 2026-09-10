import type { FinancialTransaction, FinanceSettings, FinancialAccount } from '../types';
import { getTodayString, addDays } from './dateUtils';

export interface FinanceCategoryMeta {
  id: string;
  label: string;
  icon: string; // Lucide icon identifier or emoji
  color: string; // Tailwind bg color for progress/badge
  textColor: string;
  badgeBg: string;
  isExpense: boolean;
}

export const EXPENSE_CATEGORIES: FinanceCategoryMeta[] = [
  { id: 'food', label: 'Продукты', icon: 'ShoppingBag', color: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200', isExpense: true },
  { id: 'cafe', label: 'Кафе и рестораны', icon: 'Coffee', color: 'bg-amber-500', textColor: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200', isExpense: true },
  { id: 'transport', label: 'Транспорт и авто', icon: 'Car', color: 'bg-blue-500', textColor: 'text-blue-700', badgeBg: 'bg-blue-50 border-blue-200', isExpense: true },
  { id: 'housing', label: 'Жилье и ЖКХ', icon: 'Home', color: 'bg-indigo-500', textColor: 'text-indigo-700', badgeBg: 'bg-indigo-50 border-indigo-200', isExpense: true },
  { id: 'shopping', label: 'Покупки и одежда', icon: 'Tag', color: 'bg-pink-500', textColor: 'text-pink-700', badgeBg: 'bg-pink-50 border-pink-200', isExpense: true },
  { id: 'health', label: 'Здоровье и аптека', icon: 'HeartPulse', color: 'bg-rose-500', textColor: 'text-rose-700', badgeBg: 'bg-rose-50 border-rose-200', isExpense: true },
  { id: 'entertainment', label: 'Развлечения и отдых', icon: 'Film', color: 'bg-purple-500', textColor: 'text-purple-700', badgeBg: 'bg-purple-50 border-purple-200', isExpense: true },
  { id: 'subscriptions', label: 'Подписки и связь', icon: 'Smartphone', color: 'bg-cyan-500', textColor: 'text-cyan-700', badgeBg: 'bg-cyan-50 border-cyan-200', isExpense: true },
  { id: 'beauty', label: 'Красота и уход', icon: 'Sparkles', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-700', badgeBg: 'bg-fuchsia-50 border-fuchsia-200', isExpense: true },
  { id: 'gifts', label: 'Подарки', icon: 'Gift', color: 'bg-orange-500', textColor: 'text-orange-700', badgeBg: 'bg-orange-50 border-orange-200', isExpense: true },
  { id: 'other_expense', label: 'Другое', icon: 'MoreHorizontal', color: 'bg-slate-500', textColor: 'text-slate-700', badgeBg: 'bg-slate-50 border-slate-200', isExpense: true }
];

export const INCOME_CATEGORIES: FinanceCategoryMeta[] = [
  { id: 'salary', label: 'Зарплата', icon: 'Briefcase', color: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200', isExpense: false },
  { id: 'freelance', label: 'Фриланс и проекты', icon: 'Laptop', color: 'bg-teal-500', textColor: 'text-teal-700', badgeBg: 'bg-teal-50 border-teal-200', isExpense: false },
  { id: 'investment', label: 'Инвестиции и вклады', icon: 'TrendingUp', color: 'bg-indigo-500', textColor: 'text-indigo-700', badgeBg: 'bg-indigo-50 border-indigo-200', isExpense: false },
  { id: 'gift', label: 'Подарок', icon: 'Gift', color: 'bg-amber-500', textColor: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200', isExpense: false },
  { id: 'cashback', label: 'Кешбэк и бонусы', icon: 'Percent', color: 'bg-blue-500', textColor: 'text-blue-700', badgeBg: 'bg-blue-50 border-blue-200', isExpense: false },
  { id: 'other_income', label: 'Другой доход', icon: 'PlusCircle', color: 'bg-slate-500', textColor: 'text-slate-700', badgeBg: 'bg-slate-50 border-slate-200', isExpense: false }
];

export function getCategoryMeta(categoryId: string, type: 'expense' | 'income' = 'expense'): FinanceCategoryMeta {
  const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const found = list.find(c => c.id === categoryId);
  if (found) return found;

  const fallbackList = type === 'expense' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const fallback = fallbackList.find(c => c.id === categoryId);
  if (fallback) return fallback;

  return {
    id: categoryId,
    label: categoryId || 'Без категории',
    icon: type === 'expense' ? 'Tag' : 'TrendingUp',
    color: 'bg-slate-400',
    textColor: 'text-slate-700',
    badgeBg: 'bg-slate-50 border-slate-200',
    isExpense: type === 'expense'
  };
}

export function formatCurrency(amount: number, currency: string = '₽', showSign: boolean = false): string {
  const rounded = Math.round(amount);
  const formattedNumber = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  if (showSign && amount > 0) {
    return `+${formattedNumber} ${currency}`;
  }
  return `${formattedNumber} ${currency}`;
}

export interface CategoryStat {
  category: string;
  meta: FinanceCategoryMeta;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyFinanceStats {
  yearMonth: string; // YYYY-MM
  monthName: string; // "Сентябрь 2026"
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // in % (0 - 100)
  dailyAverageExpense: number;
  budgetLimit: number;
  budgetUsedPercent: number;
  budgetRemaining: number;
  categoryExpenses: CategoryStat[];
  categoryIncomes: CategoryStat[];
  transactionCount: number;
}

const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function calculateMonthlyStats(
  transactions: FinancialTransaction[] = [],
  targetYearMonth?: string,
  settings?: FinanceSettings
): MonthlyFinanceStats {
  const today = getTodayString();
  const yearMonth = targetYearMonth || today.substring(0, 7); // "YYYY-MM"
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = `${MONTH_NAMES_RU[monthIdx] || 'Месяц'} ${year}`;

  const monthlyTransactions = transactions.filter(t => t.date && t.date.startsWith(yearMonth));

  let totalIncome = 0;
  let totalExpense = 0;

  const expenseCategoryMap = new Map<string, { amount: number; count: number }>();
  const incomeCategoryMap = new Map<string, { amount: number; count: number }>();

  monthlyTransactions.forEach(t => {
    const amt = Math.abs(t.amount || 0);
    if (t.type === 'income') {
      totalIncome += amt;
      const cur = incomeCategoryMap.get(t.category) || { amount: 0, count: 0 };
      cur.amount += amt;
      cur.count += 1;
      incomeCategoryMap.set(t.category, cur);
    } else if (t.type === 'expense') {
      totalExpense += amt;
      const cur = expenseCategoryMap.get(t.category) || { amount: 0, count: 0 };
      cur.amount += amt;
      cur.count += 1;
      expenseCategoryMap.set(t.category, cur);
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Days in this month (or passed days for daily average)
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const isCurrentMonth = today.startsWith(yearMonth);
  const passedDays = isCurrentMonth ? Math.max(1, parseInt(today.substring(8, 10), 10)) : daysInMonth;
  const dailyAverageExpense = Math.round(totalExpense / passedDays);

  const budgetLimit = settings?.monthlyBudgetLimit || 60000;
  const budgetUsedPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalExpense / budgetLimit) * 100)) : 0;
  const budgetRemaining = Math.max(0, budgetLimit - totalExpense);

  const categoryExpenses: CategoryStat[] = Array.from(expenseCategoryMap.entries())
    .map(([cat, val]) => ({
      category: cat,
      meta: getCategoryMeta(cat, 'expense'),
      amount: val.amount,
      percentage: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0,
      count: val.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const categoryIncomes: CategoryStat[] = Array.from(incomeCategoryMap.entries())
    .map(([cat, val]) => ({
      category: cat,
      meta: getCategoryMeta(cat, 'income'),
      amount: val.amount,
      percentage: totalIncome > 0 ? Math.round((val.amount / totalIncome) * 100) : 0,
      count: val.count
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    yearMonth,
    monthName,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    dailyAverageExpense,
    budgetLimit,
    budgetUsedPercent,
    budgetRemaining,
    categoryExpenses,
    categoryIncomes,
    transactionCount: monthlyTransactions.length
  };
}

export function calculateTotalBalance(transactions: FinancialTransaction[] = []): number {
  return transactions.reduce((acc, t) => {
    const amt = Math.abs(t.amount || 0);
    if (t.type === 'income') return acc + amt;
    if (t.type === 'expense') return acc - amt;
    return acc;
  }, 0);
}

export function calculateTodayStats(transactions: FinancialTransaction[] = [], todayStr?: string) {
  const targetDate = todayStr || getTodayString();
  const todayList = transactions.filter(t => t.date === targetDate);
  let todayExpense = 0;
  let todayIncome = 0;

  todayList.forEach(t => {
    const amt = Math.abs(t.amount || 0);
    if (t.type === 'income') todayIncome += amt;
    else if (t.type === 'expense') todayExpense += amt;
  });

  return {
    todayExpense,
    todayIncome,
    todayCount: todayList.length
  };
}

export function groupTransactionsByDate(transactions: FinancialTransaction[]): Record<string, FinancialTransaction[]> {
  const sorted = [...transactions].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return (b.time || '').localeCompare(a.time || '');
  });

  const groups: Record<string, FinancialTransaction[]> = {};
  sorted.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  return groups;
}

export function getDefaultSampleTransactions(): FinancialTransaction[] {
  const today = getTodayString();
  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 85000,
      category: 'salary',
      title: 'Аванс и основная выплата',
      account: 'Основная карта',
      date: addDays(today, -5),
      time: '11:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 3450,
      category: 'food',
      title: 'Супермаркет и фрукты',
      account: 'Основная карта',
      date: today,
      time: '14:20',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 650,
      category: 'cafe',
      title: 'Матча и круассан',
      account: 'Основная карта',
      date: today,
      time: '10:15',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 820,
      category: 'transport',
      title: 'Такси до работы',
      account: 'Основная карта',
      date: addDays(today, -1),
      time: '08:45',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 1450,
      category: 'health',
      title: 'Витамины и аптека',
      account: 'Основная карта',
      date: addDays(today, -2),
      time: '18:30',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 2890,
      category: 'shopping',
      title: 'Косметика и уход',
      account: 'Основная карта',
      date: addDays(today, -3),
      time: '16:10',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-7',
      type: 'income',
      amount: 12000,
      category: 'freelance',
      title: 'Оплата за дизайн проекта',
      account: 'Накопительный счет',
      date: addDays(today, -3),
      time: '13:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 499,
      category: 'subscriptions',
      title: 'Музыка и облачное хранилище',
      account: 'Основная карта',
      date: addDays(today, -4),
      time: '09:00',
      createdAt: new Date().toISOString()
    }
  ];
}

export function getDefaultSampleAccounts(): FinancialAccount[] {
  const today = getTodayString();
  return [
    {
      id: 'acc-1',
      name: 'Основная карта (Black)',
      type: 'card',
      balance: 48500,
      currency: '₽',
      color: '#1e293b',
      icon: 'CreditCard',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc-2',
      name: 'Наличные (кошелек)',
      type: 'cash',
      balance: 4200,
      currency: '₽',
      color: '#059669',
      icon: 'Banknote',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc-3',
      name: 'Заначка на отпуск 🌴',
      type: 'savings',
      balance: 75000,
      targetAmount: 150000,
      targetDate: addDays(today, 90),
      currency: '₽',
      color: '#d97706',
      icon: 'PiggyBank',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc-4',
      name: 'Подушка безопасности 🛡️',
      type: 'savings',
      balance: 100000,
      targetAmount: 150000,
      currency: '₽',
      color: '#2563eb',
      icon: 'Shield',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc-5',
      name: 'Кредитная карта 120 дней 💳',
      type: 'credit_card',
      balance: 14500,
      creditLimit: 100000,
      monthlyPayment: 3500,
      paymentDueDay: 20,
      gracePeriodDays: 120,
      currency: '₽',
      color: '#e11d48',
      icon: 'CreditCard',
      notes: 'Льготный период без процентов до 20 числа',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc-6',
      name: 'Рассрочка на ноутбук 💻',
      type: 'loan',
      balance: 24000,
      creditLimit: 48000,
      monthlyPayment: 8000,
      paymentDueDay: 15,
      currency: '₽',
      color: '#7c3aed',
      icon: 'Landmark',
      notes: 'Ежемесячный платеж 15 числа каждого месяца',
      createdAt: new Date().toISOString()
    }
  ];
}

export function calculateNetWorth(accounts: FinancialAccount[] = []) {
  let totalAssets = 0;
  let totalDebts = 0;
  let totalSavings = 0;

  accounts.forEach(acc => {
    const amt = Math.abs(acc.balance || 0);
    if (acc.type === 'credit_card' || acc.type === 'loan' || acc.type === 'debt') {
      totalDebts += amt;
    } else if (acc.type === 'savings') {
      totalSavings += amt;
      totalAssets += amt;
    } else {
      totalAssets += amt;
    }
  });

  const netWorth = totalAssets - totalDebts;

  return {
    totalAssets,
    totalDebts,
    totalSavings,
    netWorth
  };
}

export interface DebtPaymentInfo {
  account: FinancialAccount;
  paymentAmount: number;
  dueDate: string; // YYYY-MM-DD
  dueDay: number;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'urgent' | 'soon' | 'normal';
  statusLabel: string;
  isCreditCard: boolean;
}

export function getUpcomingDebtPayments(accounts: FinancialAccount[] = []): DebtPaymentInfo[] {
  const today = getTodayString();
  const [currentYear, currentMonthStr, currentDayStr] = today.split('-').map(Number);
  
  const debtAccounts = accounts.filter(
    a => (a.type === 'credit_card' || a.type === 'loan' || a.type === 'debt') && a.balance > 0
  );

  const payments: DebtPaymentInfo[] = [];

  debtAccounts.forEach(acc => {
    let dueDay = acc.paymentDueDay;
    if (!dueDay && acc.nextPaymentDate) {
      dueDay = parseInt(acc.nextPaymentDate.substring(8, 10), 10);
    }
    if (!dueDay) dueDay = 20;

    let dueYear = currentYear;
    let dueMonth = currentMonthStr;

    const daysInThisMonth = new Date(dueYear, dueMonth, 0).getDate();
    const effectiveDay = Math.min(dueDay, daysInThisMonth);

    let targetDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(effectiveDay).padStart(2, '0')}`;
    
    if (currentDayStr > effectiveDay) {
      const nextMonthDate = new Date(dueYear, dueMonth, 1);
      dueYear = nextMonthDate.getFullYear();
      dueMonth = nextMonthDate.getMonth() + 1;
      const daysInNextMonth = new Date(dueYear, dueMonth, 0).getDate();
      targetDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(Math.min(dueDay, daysInNextMonth)).padStart(2, '0')}`;
    }

    const diffTime = new Date(targetDateStr).getTime() - new Date(today).getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: DebtPaymentInfo['status'] = 'normal';
    let statusLabel = `через ${daysRemaining} дн.`;

    if (daysRemaining < 0) {
      status = 'overdue';
      statusLabel = `Просрочено на ${Math.abs(daysRemaining)} дн.!`;
    } else if (daysRemaining === 0) {
      status = 'today';
      statusLabel = 'Оплата СЕГОДНЯ!';
    } else if (daysRemaining <= 3) {
      status = 'urgent';
      statusLabel = `Через ${daysRemaining} ${daysRemaining === 1 ? 'день' : 'дня'}!`;
    } else if (daysRemaining <= 7) {
      status = 'soon';
      statusLabel = `Через ${daysRemaining} дн.`;
    }

    const paymentAmount = acc.monthlyPayment || Math.min(acc.balance, 3000);

    payments.push({
      account: acc,
      paymentAmount,
      dueDate: targetDateStr,
      dueDay: effectiveDay,
      daysRemaining,
      status,
      statusLabel,
      isCreditCard: acc.type === 'credit_card'
    });
  });

  return payments.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
