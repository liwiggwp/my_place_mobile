import React from 'react';
import type { Pill, PillLog, PillStatus } from '../../types';
import { getTodayString } from '../../utils/dateUtils';
import { Check, Clock, X, Edit3, Pill as PillIcon, Sun, Heart, Leaf } from 'lucide-react';

interface PillCardProps {
  pill: Pill;
  logs: PillLog[];
  onLogStatus: (pillId: string, scheduledTime: string, status: PillStatus) => void;
  onEdit: (pill: Pill) => void;
}

export const PillCard: React.FC<PillCardProps> = ({ pill, logs, onLogStatus, onEdit }) => {
  const todayStr = getTodayString();

  const getPillIcon = () => {
    switch (pill.category) {
      case 'vitamin':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'contraceptive':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'supplement':
        return <Leaf className="w-5 h-5 text-emerald-500" />;
      default:
        return <PillIcon className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="p-4 rounded-3xl glass-card shadow-sm border border-purple-100/60 relative overflow-hidden">
      {/* Top Details */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
            style={{ backgroundColor: `${pill.color}20`, border: `1px solid ${pill.color}40` }}
          >
            {getPillIcon()}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{pill.name}</span>
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="font-medium">{pill.dosage}</span>
              {pill.notes && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{pill.notes}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onEdit(pill)}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 active:scale-90 transition-transform cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Time slots for today */}
      <div className="mt-4 pt-3 border-t border-purple-50/80 space-y-2.5">
        {pill.times.map(time => {
          const log = logs.find(
            l => l.pillId === pill.id && l.date === todayStr && l.scheduledTime === time
          );
          const isTaken = log?.status === 'taken';
          const isSkipped = log?.status === 'skipped';

          return (
            <div
              key={time}
              className={`p-2.5 rounded-2xl flex items-center justify-between transition-all ${
                isTaken
                  ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-900'
                  : isSkipped
                  ? 'bg-slate-100/80 border border-slate-200 text-slate-500'
                  : 'bg-white/80 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isTaken ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-700">{time}</span>
                {isTaken && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Принято
                  </span>
                )}
                {isSkipped && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    Пропущено
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isTaken ? (
                  <button
                    onClick={() => onLogStatus(pill.id, time, 'skipped')}
                    className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Выпито</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onLogStatus(pill.id, time, 'taken')}
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-200 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Выпить</span>
                    </button>

                    <button
                      onClick={() => onLogStatus(pill.id, time, 'skipped')}
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
                      title="Пропустить"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
