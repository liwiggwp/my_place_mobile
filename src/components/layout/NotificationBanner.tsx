import React, { useEffect, useState } from 'react';
import {
  Bell,
  X,
  Droplets,
  Pill as PillIcon,
  CheckSquare,
  Heart,
  AlertCircle
} from 'lucide-react';

interface NotificationBannerProps {
  alert: {
    id: string;
    title: string;
    body: string;
    type: 'pill' | 'water' | 'cycle' | 'task' | 'info';
  } | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ alert, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;

    setProgress(100);
    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [alert, onDismiss]);

  if (!alert) return null;

  const isOverdue = alert.title.toLowerCase().includes('просрочен');

  const getConfig = () => {
    if (isOverdue) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        badgeBg: 'bg-rose-50 border-rose-200/80',
        glowColor: 'rgba(244, 63, 94, 0.15)',
        typeLabel: 'ПРОСРОЧЕНО',
        labelColor: 'text-rose-600',
        progressBarBg: 'bg-rose-500'
      };
    }

    switch (alert.type) {
      case 'task':
        return {
          icon: <CheckSquare className="w-5 h-5 text-indigo-600" />,
          badgeBg: 'bg-indigo-50 border-indigo-200/80',
          glowColor: 'rgba(99, 102, 241, 0.15)',
          typeLabel: 'ЗАДАЧА',
          labelColor: 'text-indigo-600',
          progressBarBg: 'bg-indigo-600'
        };
      case 'pill':
        return {
          icon: <PillIcon className="w-5 h-5 text-purple-600" />,
          badgeBg: 'bg-purple-50 border-purple-200/80',
          glowColor: 'rgba(168, 85, 247, 0.15)',
          typeLabel: 'ТАБЛЕТКИ',
          labelColor: 'text-purple-600',
          progressBarBg: 'bg-purple-600'
        };
      case 'water':
        return {
          icon: <Droplets className="w-5 h-5 text-sky-500" />,
          badgeBg: 'bg-sky-50 border-sky-200/80',
          glowColor: 'rgba(14, 165, 233, 0.15)',
          typeLabel: 'ВОДНЫЙ БАЛАНС',
          labelColor: 'text-sky-600',
          progressBarBg: 'bg-sky-500'
        };
      case 'cycle':
        return {
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          badgeBg: 'bg-rose-50 border-rose-200/80',
          glowColor: 'rgba(244, 63, 94, 0.15)',
          typeLabel: 'КАЛЕНДАРЬ ЦИКЛА',
          labelColor: 'text-rose-500',
          progressBarBg: 'bg-rose-500'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-slate-700" />,
          badgeBg: 'bg-slate-100 border-slate-200',
          glowColor: 'rgba(32, 58, 95, 0.12)',
          typeLabel: 'MYPLACE',
          labelColor: 'text-slate-600',
          progressBarBg: 'bg-slate-800'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed top-3 inset-x-3.5 z-50 max-w-md mx-auto transition-all duration-300">
      <div
        style={{
          boxShadow: `0 20px 40px -12px ${config.glowColor}, 0 4px 16px -2px rgba(0, 0, 0, 0.06)`
        }}
        className="relative overflow-hidden rounded-[26px] bg-white/95 backdrop-blur-2xl border border-white/80 p-4"
      >
        <div className="flex items-start gap-3.5">
          {/* Glowing Vector Icon Badge */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${config.badgeBg}`}
          >
            {config.icon}
          </div>

          {/* Text Information */}
          <div className="flex-1 min-w-0 pr-1">
            {/* Top Micro-Header */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className={`text-[10px] font-extrabold tracking-wider uppercase ${config.labelColor}`}>
                  {config.typeLabel}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">сейчас</span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-black text-slate-900 truncate leading-tight">
              {alert.title}
            </h4>

            {/* Body */}
            <p className="text-xs font-medium text-slate-600 mt-1 leading-snug">
              {alert.body}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 active:scale-90 transition-all cursor-pointer shrink-0 mt-0.5"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Subtle Countdown Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/80">
          <div
            className={`h-full transition-all duration-75 ease-linear ${config.progressBarBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
