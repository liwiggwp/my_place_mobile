import React from 'react';
import type { DualColorTheme } from '../../types';
import { Trophy } from 'lucide-react';

interface WaterWaveProps {
  currentAmount: number;
  goalAmount: number;
  theme?: DualColorTheme;
  onOpenGoalModal: () => void;
}

export const WaterWave: React.FC<WaterWaveProps> = ({
  currentAmount,
  goalAmount,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onOpenGoalModal
}) => {
  const percent = Math.min(100, Math.round((currentAmount / goalAmount) * 100));
  const isGoalReached = currentAmount >= goalAmount;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 glass-card shadow-lg shadow-slate-200/50 flex flex-col items-center text-center">
      {/* Background ambient lighting */}
      <div
        style={{ backgroundColor: `${theme.primary}15` }}
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl -z-10 pointer-events-none"
      />
      <div
        style={{ backgroundColor: `${theme.secondary}15` }}
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      {/* Main Glass Water Vessel */}
      <div className="relative w-52 h-52 rounded-full p-2 bg-gradient-to-b from-white/90 to-slate-100/80 shadow-inner border-4 border-white flex items-center justify-center overflow-hidden my-2">
        {/* Animated Water Fill */}
        <div
          className="absolute bottom-0 inset-x-0 transition-all duration-700 ease-out"
          style={{
            height: `${percent}%`,
            background: `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`
          }}
        >
          {/* Subtle Wave Top */}
          <div className="absolute -top-3 inset-x-0 h-4 opacity-70 bg-white/40 rounded-[50%]" />
        </div>

        {/* Center Text Info */}
        <div className="relative z-10 flex flex-col items-center justify-center text-slate-800 drop-shadow-xs">
          <span
            style={{ color: theme.primary }}
            className="text-[11px] font-bold uppercase tracking-wider bg-white/85 px-2.5 py-0.5 rounded-full backdrop-blur-xs mb-1"
          >
            {percent}% нормы
          </span>

          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {currentAmount}
            </span>
            <span className="text-xs font-bold text-slate-600">/{goalAmount} мл</span>
          </div>

          {isGoalReached ? (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full shadow-xs">
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>Цель достигнута!</span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-slate-600 mt-1">
              Осталось: {goalAmount - currentAmount} мл
            </span>
          )}
        </div>
      </div>

      {/* Subtitle / Edit Goal Button */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={onOpenGoalModal}
          style={{ color: theme.primary }}
          className="text-xs font-semibold underline underline-offset-4 active:scale-95 cursor-pointer"
        >
          Настроить цель ({goalAmount} мл)
        </button>
      </div>
    </div>
  );
};
