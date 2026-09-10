import React, { useState, useEffect } from 'react';
import type { FinancialAccount, DualColorTheme } from '../../types';
import { formatCurrency } from '../../utils/financeUtils';
import {
  X,
  Check,
  CreditCard,
  Landmark
} from 'lucide-react';

interface DebtPayModalProps {
  isOpen: boolean;
  debtAccount: FinancialAccount | null;
  accounts: FinancialAccount[];
  currency?: string;
  theme?: DualColorTheme;
  onPay: (fromAccountId: string, debtAccountId: string, amount: number, note?: string) => void;
  onClose: () => void;
}

export const DebtPayModal: React.FC<DebtPayModalProps> = ({
  isOpen,
  debtAccount,
  accounts = [],
  currency = '₽',
  theme = { primary: '#203A5F', secondary: '#595959' },
  onPay,
  onClose
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen && debtAccount) {
      const sourceAcc = accounts.find(a => a.id !== debtAccount.id && (a.type === 'card' || a.type === 'cash'));
      setFromAccountId(sourceAcc?.id || accounts[0]?.id || '');
      
      const defaultPayment = debtAccount.monthlyPayment || debtAccount.balance || 0;
      setAmount(defaultPayment.toString());
      setNote(`Платеж по "${debtAccount.name}"`);
    }
  }, [isOpen, debtAccount, accounts]);

  if (!isOpen || !debtAccount) return null;

  const minPayment = debtAccount.monthlyPayment || 0;
  const fullDebt = debtAccount.balance || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId) {
      alert('Пожалуйста, выберите счет для оплаты.');
      return;
    }
    const numAmount = parseFloat(amount.replace(/\s+/g, '').replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Пожалуйста, укажите корректную сумму платежа.');
      return;
    }

    onPay(fromAccountId, debtAccount.id, numAmount, note.trim() || undefined);
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
              style={{ backgroundColor: debtAccount.color || '#e11d48', color: '#ffffff' }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
            >
              {debtAccount.type === 'credit_card' ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <Landmark className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Погашение: {debtAccount.name}
              </h3>
              <p className="text-[11px] text-[#595959]">
                Остаток долга: <strong className="text-rose-600 font-bold">{formatCurrency(fullDebt, currency)}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Quick Pay Options */}
          <div className="grid grid-cols-2 gap-2">
            {minPayment > 0 && minPayment < fullDebt && (
              <button
                type="button"
                onClick={() => setAmount(minPayment.toString())}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  amount === minPayment.toString()
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Обязательный платеж</span>
                <span className="text-sm font-black text-slate-800 block">
                  {formatCurrency(minPayment, currency)}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAmount(fullDebt.toString())}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                minPayment > 0 && minPayment < fullDebt ? '' : 'col-span-2'
              } ${
                amount === fullDebt.toString()
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">Погасить весь долг</span>
              <span className="text-sm font-black text-slate-800 block">
                {formatCurrency(fullDebt, currency)}
              </span>
            </button>
          </div>

          {/* Amount input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Сумма к списанию ({currency})
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-3xl font-black text-slate-800 bg-transparent text-center focus:outline-hidden w-44 placeholder:text-slate-300"
              />
              <span className="text-2xl font-bold text-slate-400">{currency}</span>
            </div>
          </div>

          {/* Source Account (From) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">С какого счета списать деньги</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {accounts
                .filter(a => a.id !== debtAccount.id && a.type !== 'credit_card' && a.type !== 'loan')
                .map(acc => {
                  const isSelected = fromAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setFromAccountId(acc.id)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={{ backgroundColor: acc.color || '#1e293b' }}
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">{acc.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 shrink-0">
                        {formatCurrency(acc.balance, acc.currency || currency)}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Примечание</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              style={{ backgroundColor: theme.primary }}
              className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Check className="w-4 h-4" />
              <span>Подтвердить оплату и уменьшить долг</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
