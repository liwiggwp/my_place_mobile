import React from 'react';
import type { WaterLog } from '../../types';
import { Trash2, Droplet } from 'lucide-react';

interface WaterLogListProps {
  logs: WaterLog[];
  onDeleteLog: (id: string) => void;
}

export const WaterLogList: React.FC<WaterLogListProps> = ({ logs, onDeleteLog }) => {
  if (logs.length === 0) {
    return (
      <div className="p-6 rounded-3xl glass-card text-center text-slate-400 text-xs">
        <Droplet className="w-8 h-8 mx-auto text-sky-200 mb-2 animate-bounce-short" />
        <p className="font-semibold text-slate-600">Сегодня еще не выпито воды</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Нажмите на стакан выше, чтобы начать трекинг</p>
      </div>
    );
  }

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getDrinkIcon = (type: string) => {
    switch (type) {
      case 'tea':
      case 'coffee':
        return '☕';
      default:
        return '💧';
    }
  };

  return (
    <div className="p-5 rounded-3xl glass-card shadow-sm space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        История за сегодня
      </h4>

      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        {logs.map(log => (
          <div
            key={log.id}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 border border-sky-50 shadow-xs text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{getDrinkIcon(log.type)}</span>
              <div>
                <span className="font-bold text-slate-800">+{log.amount} мл</span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {formatLogTime(log.timestamp)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDeleteLog(log.id)}
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 active:scale-90 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
