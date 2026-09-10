import React, { useState, useEffect } from 'react';
import type { FinanceSettings, DualColorTheme } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/financeUtils';
import { X, Check, Sliders, DollarSign, PieChart } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  settings?: FinanceSettings;
  theme?: DualColorTheme;
  onSave: (newSettings: FinanceSettings) => void;
  onClose: () => void;
}

const CURRENCIES = [
  { symbol: '₽', label: 'Рубли (₽)' },
  { symbol: '$', label: 'Доллары ($)' },
  { symbol: '€', label: 'Евро (€)' },
  { symbol: '₸', label: 'Тенге (₸)' },
  { symbol: 'Br', label: 'Бел. руб (Br)' }
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  settings,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onSave,
  onClose
}) => {
  const [monthlyLimit, setMonthlyLimit] = useState<string>('60000');
  const [currency, setCurrency] = useState<string>('₽');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setMonthlyLimit(settings?.monthlyBudgetLimit?.toString() || '60000');
      setCurrency(settings?.currency || '₽');

      const catMap: Record<string, string> = {};
      if (settings?.categoryBudgets) {
        settings.categoryBudgets.forEach(cb => {
          catMap[cb.category] = cb.limit.toString();
        });
      }
      setCategoryBudgets(catMap);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleCategoryLimitChange = (catId: string, val: string) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [catId]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(monthlyLimit.replace(/\s+/g, '')) || 0;

    const cbList = Object.entries(categoryBudgets)
      .map(([cat, val]) => ({
        category: cat,
        limit: parseFloat(val.replace(/\s+/g, '')) || 0
      }))
      .filter(cb => cb.limit > 0);

    onSave({
      currency,
      monthlyBudgetLimit: limitNum,
      categoryBudgets: cbList
    });
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
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Настройка бюджета</h3>
              <p className="text-[11px] text-[#595959]">Лимиты трат и валюта учета</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Monthly Limit Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Общий бюджет расходов на месяц ({currency})
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="60000"
                value={monthlyLimit}
                onChange={e => setMonthlyLimit(e.target.value)}
                className="text-3xl font-black text-slate-800 bg-transparent text-center focus:outline-hidden w-48 placeholder:text-slate-300"
              />
              <span className="text-2xl font-bold text-slate-400">{currency}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Шкала бюджета будет показывать остаток и дневную норму трат
            </p>
          </div>

          {/* Currency Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Валюта</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {CURRENCIES.map(curr => (
                <button
                  key={curr.symbol}
                  type="button"
                  onClick={() => setCurrency(curr.symbol)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    currency === curr.symbol
                      ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {curr.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Category Budgets (Optional) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-indigo-600" />
                <span>Лимиты по категориям (необязательно)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Укажите желаемые лимиты трат по отдельным статьям расходов:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {EXPENSE_CATEGORIES.slice(0, 6).map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-xs font-bold text-slate-700 truncate">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="без лимита"
                      value={categoryBudgets[cat.id] || ''}
                      onChange={e => handleCategoryLimitChange(cat.id, e.target.value)}
                      className="w-24 px-2 py-1 text-right rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden"
                    />
                    <span className="text-xs font-semibold text-slate-400">{currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              style={{ backgroundColor: theme.primary }}
              className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить настройки бюджета</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
