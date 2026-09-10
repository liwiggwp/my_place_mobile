import type { FinancialTransaction, FinanceSettings } from '../types';
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
    } else {
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
    return t.type === 'income' ? acc + amt : acc - amt;
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
    else todayExpense += amt;
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
