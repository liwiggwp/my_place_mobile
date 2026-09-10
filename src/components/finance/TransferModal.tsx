import React, { useState, useEffect } from 'react';
import type { FinancialAccount, DualColorTheme } from '../../types';
import { formatCurrency } from '../../utils/financeUtils';
import {
  X,
  Check,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  PiggyBank,
  Landmark
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  accounts: FinancialAccount[];
  defaultFromAccountId?: string;
  defaultToAccountId?: string;
  currency?: string;
  theme?: DualColorTheme;
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => void;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  accounts = [],
  defaultFromAccountId,
  defaultToAccountId,
  currency = '₽',
  theme = { primary: '#203A5F', secondary: '#595959' },
  onTransfer,
  onClose
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const activeAccounts = accounts.filter(a => !a.isArchived);
      const fromAcc = defaultFromAccountId || activeAccounts.find(a => a.type === 'card' || a.type === 'cash')?.id || activeAccounts[0]?.id || '';
      const toAcc = defaultToAccountId || activeAccounts.find(a => a.id !== fromAcc)?.id || '';
      
      setFromAccountId(fromAcc);
      setToAccountId(toAcc);
      setAmount('');
      setNote('');
    }
  }, [isOpen, accounts, defaultFromAccountId, defaultToAccountId]);

  if (!isOpen) return null;

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSwap = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId) {
      alert('Пожалуйста, выберите оба счета.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('Счет списания и счет зачисления должны быть разными.');
      return;
    }
    const numAmount = parseFloat(amount.replace(/\s+/g, '').replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Пожалуйста, укажите корректную сумму перевода.');
      return;
    }

    onTransfer(fromAccountId, toAccountId, numAmount, note.trim() || undefined);
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
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Перевод / Пополнение заначки</h3>
              <p className="text-[11px] text-[#595959]">Между своими картами, копилками и кредитами</p>
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
          {/* Source Account (FROM) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Откуда списать (Счет списания)</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {accounts.map(acc => {
                const isSelected = fromAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setFromAccountId(acc.id)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
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
                        {acc.type === 'savings' ? (
                          <PiggyBank className="w-3.5 h-3.5" />
                        ) : acc.type === 'cash' ? (
                          <Banknote className="w-3.5 h-3.5" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">{acc.name}</span>
                        <span className="text-[10px] text-slate-400 block">{acc.type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-800 shrink-0">
                      {formatCurrency(acc.balance, acc.currency || currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-90 transition-all cursor-pointer shadow-xs border border-slate-200"
              title="Поменять местами"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Target Account (TO) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Куда зачислить (Счет зачисления / Погашение долга)</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {accounts.map(acc => {
                const isSelected = toAccountId === acc.id;
                const isDebt = acc.type === 'credit_card' || acc.type === 'loan';
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setToAccountId(acc.id)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: acc.color || '#1e293b' }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                      >
                        {acc.type === 'savings' ? (
                          <PiggyBank className="w-3.5 h-3.5" />
                        ) : isDebt ? (
                          <Landmark className="w-3.5 h-3.5" />
                        ) : acc.type === 'cash' ? (
                          <Banknote className="w-3.5 h-3.5" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">{acc.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {isDebt ? `Долг: ${formatCurrency(acc.balance, acc.currency)}` : acc.type}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${isDebt ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatCurrency(acc.balance, acc.currency || currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Сумма перевода ({currency})
            </label>
            <div className="flex items-center justify-center gap-2">
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
              <span className="text-2xl font-bold text-slate-400">{currency}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1000, 5000, 10000, 25000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddPreset(val)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  +{val / 1000}к
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Комментарий (необязательно)</label>
            <input
              type="text"
              placeholder="например: перевел на отпуск или погасил кредитку"
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
              <span>Выполнить перевод</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
