import React, { useState, useEffect } from 'react';
import type { FinancialTransaction, TransactionType, DualColorTheme } from '../../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/financeUtils';
import { getTodayString } from '../../utils/dateUtils';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  Wallet,
  Check,
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
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  transactionToEdit?: FinancialTransaction | null;
  defaultType?: TransactionType;
  currency?: string;
  theme?: DualColorTheme;
  onSave: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
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

const ACCOUNT_OPTIONS = ['Основная карта', 'Наличные', 'Накопительный счет', 'Кредитка', 'Другое'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  transactionToEdit,
  defaultType = 'expense',
  currency = '₽',
  theme = { primary: '#203A5F', secondary: '#595959' },
  onSave,
  onDelete,
  onClose
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [title, setTitle] = useState<string>('');
  const [account, setAccount] = useState<string>('Основная карта');
  const [date, setDate] = useState<string>(getTodayString());
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString());
        setCategory(transactionToEdit.category);
        setTitle(transactionToEdit.title || '');
        setAccount(transactionToEdit.account || 'Основная карта');
        setDate(transactionToEdit.date || getTodayString());
        setTime(transactionToEdit.time || '');
      } else {
        setType(defaultType);
        setAmount('');
        setCategory(defaultType === 'expense' ? 'food' : 'salary');
        setTitle('');
        setAccount('Основная карта');
        setDate(getTodayString());
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hh}:${mm}`);
      }
    }
  }, [isOpen, transactionToEdit, defaultType]);

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense' && !EXPENSE_CATEGORIES.some(c => c.id === category)) {
      setCategory('food');
    } else if (newType === 'income' && !INCOME_CATEGORIES.some(c => c.id === category)) {
      setCategory('salary');
    }
  };

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/\s+/g, '').replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Пожалуйста, укажите корректную сумму операции.');
      return;
    }

    onSave(
      {
        type,
        amount: numAmount,
        category,
        title: title.trim() || undefined,
        account,
        date,
        time: time || undefined
      },
      transactionToEdit ? transactionToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col border border-slate-100 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                {transactionToEdit ? 'Редактировать запись' : type === 'expense' ? 'Новый расход' : 'Новый доход'}
              </h3>
              <p className="text-[11px] text-[#595959]">
                {type === 'expense' ? 'Списание средств' : 'Пополнение баланса'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Type Toggle: Expense / Income */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Расход</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Доход</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Сумма операции ({currency})
            </label>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-2xl font-black ${
                  type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {type === 'expense' ? '-' : '+'}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-3xl font-black text-slate-800 bg-transparent text-center focus:outline-hidden w-44 placeholder:text-slate-300"
              />
              <span className="text-xl font-bold text-slate-400">{currency}</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[100, 500, 1000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddPreset(val)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  +{val >= 1000 ? `${val / 1000}к` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Категория</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map(cat => {
                const isSelected = category === cat.id;
                const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Tag;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-xs scale-[1.02]'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : `${cat.badgeBg} ${cat.textColor}`
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Комментарий / Название (необязательно)</label>
            <input
              type="text"
              placeholder="например, Продукты ВкусВилл или Аванс"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          {/* Account selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Счет / Кошелек</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ACCOUNT_OPTIONS.map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccount(acc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    account === acc
                      ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Дата</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Время</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            {transactionToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Удалить эту финансовую операцию?')) {
                    onDelete(transactionToEdit.id);
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Удалить"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              style={{ backgroundColor: theme.primary }}
              className="flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Check className="w-4 h-4" />
              <span>{transactionToEdit ? 'Сохранить изменения' : 'Добавить запись'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
