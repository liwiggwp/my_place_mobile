import React, { useState } from 'react';
import type { DrinkType } from '../../types';
import { Coffee, Droplets, GlassWater } from 'lucide-react';

interface WaterQuickAddProps {
  onAddWater: (amount: number, type: DrinkType) => void;
}

export const WaterQuickAdd: React.FC<WaterQuickAddProps> = ({ onAddWater }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const presets: { amount: number; label: string; icon: React.ReactNode; type: DrinkType }[] = [
    { amount: 150, label: '150 мл', icon: <Coffee className="w-5 h-5 text-amber-600" />, type: 'tea' },
    { amount: 250, label: '250 мл', icon: <GlassWater className="w-5 h-5 text-sky-500" />, type: 'water' },
    { amount: 330, label: '330 мл', icon: <GlassWater className="w-5 h-5 text-sky-600" />, type: 'water' },
    { amount: 500, label: '500 мл', icon: <Droplets className="w-5 h-5 text-blue-500" />, type: 'water' }
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      onAddWater(val, 'water');
      setCustomAmount('');
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Быстрое добавление
        </h4>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs font-bold text-sky-600 active:scale-95 transition-transform cursor-pointer"
        >
          {showCustom ? 'Скрыть' : '+ Свой объем'}
        </button>
      </div>

      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-2 p-3 rounded-2xl bg-sky-50 border border-sky-100">
          <input
            type="number"
            min="10"
            max="2000"
            step="10"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder="Введите мл (например: 200)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-sm active:scale-95 cursor-pointer"
          >
            Добавить
          </button>
        </form>
      )}

      <div className="grid grid-cols-4 gap-2">
        {presets.map(item => (
          <button
            key={item.amount}
            onClick={() => onAddWater(item.amount, item.type)}
            className="p-3 rounded-2xl bg-white/90 border border-sky-100 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all hover:bg-sky-50 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-bold text-slate-800">+{item.amount}</span>
            <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
