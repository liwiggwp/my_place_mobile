import React, { useEffect } from 'react';
import { Bell, X, Droplets, Pill as PillIcon } from 'lucide-react';

interface NotificationBannerProps {
  alert: {
    id: string;
    title: string;
    body: string;
    type: 'pill' | 'water' | 'cycle' | 'info';
  } | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ alert, onDismiss }) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const getIcon = () => {
    switch (alert.type) {
      case 'pill':
        return <PillIcon className="w-5 h-5 text-purple-600" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      default:
        return <Bell className="w-5 h-5 text-rose-600" />;
    }
  };

  const getGradient = () => {
    switch (alert.type) {
      case 'pill':
        return 'from-purple-500/10 to-indigo-500/10 border-purple-200';
      case 'water':
        return 'from-sky-500/10 to-blue-500/10 border-sky-200';
      default:
        return 'from-rose-500/10 to-pink-500/10 border-rose-200';
    }
  };

  return (
    <div className="fixed top-3 inset-x-4 z-50 max-w-md mx-auto animate-bounce-short">
      <div
        className={`p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border shadow-xl shadow-slate-900/10 flex items-start gap-3.5 ${getGradient()}`}
      >
        <div className="p-2.5 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 truncate">{alert.title}</h4>
            <span className="text-[10px] text-slate-400 font-medium">Сейчас</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.body}</p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 active:scale-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
