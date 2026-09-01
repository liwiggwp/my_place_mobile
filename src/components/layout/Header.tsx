import React from 'react';
import type { DualColorTheme } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { MyPlaceLogo } from '../common/MyPlaceLogo';
import { UserAvatar } from '../common/UserAvatar';

interface HeaderProps {
  currentTab: string;
  avatarEmoji?: string;
  theme?: DualColorTheme;
  onOpenInstall?: () => void;
  onOpenProfile?: () => void;
  onBackToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  avatarEmoji = 'user',
  theme = { primary: '#203A5F', secondary: '#595959' },
  onOpenProfile,
  onBackToHome
}) => {
  const isSubScreen = currentTab === 'cycle' || currentTab === 'pills' || currentTab === 'water' || currentTab === 'tasks';

  const getTabTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'MyPlace';
      case 'desktops':
        return 'Рабочие столы';
      case 'cycle':
        return 'Мой Цикл';
      case 'tasks':
        return 'Задачи';
      case 'pills':
        return 'Таблетки и витамины';
      case 'water':
        return 'Водный Баланс';
      case 'settings':
        return 'Настройки';
      default:
        return 'MyPlace';
    }
  };

  return (
    <header className="sticky top-0 z-30 pt-safe px-4 md:px-6 pb-3 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
        {isSubScreen ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              aria-label="Назад"
              className="p-2.5 rounded-2xl bg-slate-50 shadow-xs border border-slate-200 text-slate-700 active:scale-90 transition-transform flex items-center justify-center cursor-pointer hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.primary }} />
            </button>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: theme.primary }}>
              {getTabTitle()}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-center p-1.5 shadow-2xs">
              <MyPlaceLogo
                className="w-7 h-7"
                primaryColor={theme.primary}
                secondaryColor={theme.secondary}
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
              {getTabTitle()}
            </h1>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            title="Личный кабинет"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
            }}
            className="w-10 h-10 rounded-2xl shadow-md shadow-slate-300 flex items-center justify-center text-white active:scale-90 transition-transform relative group border border-white/80 cursor-pointer"
          >
            <UserAvatar avatarId={avatarEmoji} className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
