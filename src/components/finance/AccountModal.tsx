import React, { useState, useEffect } from 'react';
import type { FinancialAccount, AccountType, DualColorTheme } from '../../types';
import {
  X,
  Check,
  CreditCard,
  Banknote,
  PiggyBank,
  Landmark,
  Shield,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  accountToEdit?: FinancialAccount | null;
  defaultType?: AccountType;
  currency?: string;
  theme?: DualColorTheme;
  onSave: (account: Omit<FinancialAccount, 'id' | 'createdAt'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ACCOUNT_TYPE_OPTIONS: { type: AccountType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: 'card', label: 'Дебетовая карта', icon: CreditCard, desc: 'Зарплатная, повседневная карта' },
  { type: 'cash', label: 'Наличные', icon: Banknote, desc: 'Кошелек, наличные дома' },
  { type: 'savings', label: 'Заначка / Копилка', icon: PiggyBank, desc: 'Накопления, подушка безопасности, цель' },
  { type: 'credit_card', label: 'Кредитная карта', icon: CreditCard, desc: 'Кредитка с лимитом и льготным периодом' },
  { type: 'loan', label: 'Кредит / Рассрочка', icon: Landmark, desc: 'Кредит, ипотека, рассрочка на покупку' },
  { type: 'debt', label: 'Долг / Заем', icon: Shield, desc: 'Частный долг или заем' }
];

const COLOR_PRESETS = [
  { label: 'Графит', color: '#1e293b' },
  { label: 'Изумруд', color: '#059669' },
  { label: 'Сапфир', color: '#2563eb' },
  { label: 'Янтарь', color: '#d97706' },
  { label: 'Рубин', color: '#e11d48' },
  { label: 'Фиолетовый', color: '#7c3aed' },
  { label: 'Бирюза', color: '#0d9488' },
  { label: 'Розовый', color: '#db2777' }
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  accountToEdit,
  defaultType = 'card',
  currency = '₽',
  theme = { primary: '#203A5F', secondary: '#595959' },
  onSave,
  onDelete,
  onClose
}) => {
  const [type, setType] = useState<AccountType>(defaultType);
  const [name, setName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [color, setColor] = useState<string>('#1e293b');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');

  // Credit / Loan specific fields
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [paymentDueDay, setPaymentDueDay] = useState<string>('20');
  const [gracePeriodDays, setGracePeriodDays] = useState<string>('120');
  const [interestRate, setInterestRate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setType(accountToEdit.type);
        setName(accountToEdit.name);
        setBalance(accountToEdit.balance.toString());
        setColor(accountToEdit.color || '#1e293b');
        setTargetAmount(accountToEdit.targetAmount ? accountToEdit.targetAmount.toString() : '');
        setTargetDate(accountToEdit.targetDate || '');
        setCreditLimit(accountToEdit.creditLimit ? accountToEdit.creditLimit.toString() : '');
        setMonthlyPayment(accountToEdit.monthlyPayment ? accountToEdit.monthlyPayment.toString() : '');
        setPaymentDueDay(accountToEdit.paymentDueDay ? accountToEdit.paymentDueDay.toString() : '20');
        setGracePeriodDays(accountToEdit.gracePeriodDays ? accountToEdit.gracePeriodDays.toString() : '120');
        setInterestRate(accountToEdit.interestRate ? accountToEdit.interestRate.toString() : '');
        setNotes(accountToEdit.notes || '');
      } else {
        setType(defaultType);
        setName('');
        setBalance('');
        setColor(
          defaultType === 'savings'
            ? '#d97706'
            : defaultType === 'credit_card'
            ? '#e11d48'
            : defaultType === 'loan'
            ? '#7c3aed'
            : defaultType === 'cash'
            ? '#059669'
            : '#1e293b'
        );
        setTargetAmount('');
        setTargetDate('');
        setCreditLimit('');
        setMonthlyPayment('');
        setPaymentDueDay('20');
        setGracePeriodDays('120');
        setInterestRate('');
        setNotes('');
      }
    }
  }, [isOpen, accountToEdit, defaultType]);

  if (!isOpen) return null;

  const isDebtOrCredit = type === 'credit_card' || type === 'loan' || type === 'debt';
  const isSavings = type === 'savings';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Пожалуйста, укажите название счета или заначки.');
      return;
    }

    const numBalance = parseFloat(balance.replace(/\s+/g, '').replace(',', '.')) || 0;
    const numTarget = targetAmount ? parseFloat(targetAmount.replace(/\s+/g, '')) : undefined;
    const numLimit = creditLimit ? parseFloat(creditLimit.replace(/\s+/g, '')) : undefined;
    const numPayment = monthlyPayment ? parseFloat(monthlyPayment.replace(/\s+/g, '')) : undefined;
    const numDueDay = paymentDueDay ? parseInt(paymentDueDay, 10) : undefined;
    const numGrace = gracePeriodDays ? parseInt(gracePeriodDays, 10) : undefined;
    const numRate = interestRate ? parseFloat(interestRate.replace(',', '.')) : undefined;

    onSave(
      {
        name: name.trim(),
        type,
        balance: numBalance,
        currency,
        color,
        targetAmount: isSavings ? numTarget : undefined,
        targetDate: isSavings && targetDate ? targetDate : undefined,
        creditLimit: isDebtOrCredit ? numLimit : undefined,
        monthlyPayment: isDebtOrCredit ? numPayment : undefined,
        paymentDueDay: isDebtOrCredit ? numDueDay : undefined,
        gracePeriodDays: type === 'credit_card' ? numGrace : undefined,
        interestRate: isDebtOrCredit ? numRate : undefined,
        notes: notes.trim() || undefined
      },
      accountToEdit ? accountToEdit.id : undefined
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
              style={{ backgroundColor: color, color: '#ffffff' }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
            >
              {isSavings ? (
                <PiggyBank className="w-5 h-5" />
              ) : isDebtOrCredit ? (
                <Landmark className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                {accountToEdit ? 'Редактировать счет' : 'Новый счет / заначка / кредит'}
              </h3>
              <p className="text-[11px] text-[#595959]">
                {isSavings ? 'Копилка или заначка на цель' : isDebtOrCredit ? 'Кредит или кредитная карта' : 'Банковская карта или кошелек'}
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
          {/* Account Type Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Тип счета / кошелька</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCOUNT_TYPE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setType(opt.type);
                      if (opt.type === 'savings') setColor('#d97706');
                      else if (opt.type === 'credit_card') setColor('#e11d48');
                      else if (opt.type === 'loan') setColor('#7c3aed');
                      else if (opt.type === 'cash') setColor('#059669');
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-2xs scale-[1.02]'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Название {isSavings ? 'заначки/копилки' : isDebtOrCredit ? 'кредита/карты' : 'счета'}
            </label>
            <input
              type="text"
              required
              placeholder={
                isSavings
                  ? 'например: Заначка на отпуск или Копилка на авто'
                  : type === 'credit_card'
                  ? 'например: Тинькофф 120 дней или Сбер Кредитка'
                  : type === 'loan'
                  ? 'например: Автокредит или Рассрочка на телефон'
                  : type === 'cash'
                  ? 'например: Наличные в кошельке или Конверт дома'
                  : 'например: Основная зарплатная карта'
              }
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          {/* Current Balance / Current Debt */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isDebtOrCredit ? 'Текущий остаток долга' : 'Текущий баланс'} ({currency})
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                className="text-3xl font-black text-slate-800 bg-transparent text-center focus:outline-hidden w-44 placeholder:text-slate-300"
              />
              <span className="text-2xl font-bold text-slate-400">{currency}</span>
            </div>
          </div>

          {/* SAVINGS SPECIFIC: Target Goal & Target Date */}
          {isSavings && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Цель накопления (необязательно)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-800">Сумма цели ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100 000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-800">Срок цели</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CREDIT & LOAN SPECIFIC: Payment date, min payment, limit, grace */}
          {isDebtOrCredit && (
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>Параметры платежей и контроля долга</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Due day of month */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-rose-800">День платежа в месяце</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      placeholder="20"
                      value={paymentDueDay}
                      onChange={e => setPaymentDueDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-slate-800 focus:outline-hidden"
                    />
                    <span className="text-xs font-bold text-rose-800 shrink-0">-е число</span>
                  </div>
                </div>

                {/* Monthly min payment */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-rose-800">
                    {type === 'credit_card' ? 'Мин. платеж' : 'Ежемесячный взнос'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3 500"
                    value={monthlyPayment}
                    onChange={e => setMonthlyPayment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                {/* Total Credit Limit / Total Loan Amount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-rose-800">
                    {type === 'credit_card' ? 'Кредитный лимит' : 'Сумма кредита'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100 000"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                {/* Grace Period or Interest Rate */}
                {type === 'credit_card' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-rose-800">Беспроцентный период</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="120"
                        value={gracePeriodDays}
                        onChange={e => setGracePeriodDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                      <span className="text-xs font-bold text-rose-800 shrink-0">дней</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-rose-800">Ставка (% годовых)</label>
                    <input
                      type="text"
                      placeholder="14.5"
                      value={interestRate}
                      onChange={e => setInterestRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Цвет карточки</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-7 h-7 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    color === c.color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {color === c.color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Заметка / Примечание</label>
            <input
              type="text"
              placeholder="например: дата закрытия, привязанный банк..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            {accountToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Удалить счет "${accountToEdit.name}"?`)) {
                    onDelete(accountToEdit.id);
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Удалить счет"
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
              <span>{accountToEdit ? 'Сохранить изменения' : 'Создать счет'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
