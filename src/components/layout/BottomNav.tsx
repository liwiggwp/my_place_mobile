import React from 'react';
import type { TabType, DualColorTheme } from '../../types';
import { LayoutGrid, Layers, SlidersHorizontal } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  theme?: DualColorTheme;
  onSelectTab: (tab: TabType) => void;
  pendingPillsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  theme = { primary: '#203A5F', secondary: '#595959' },
  onSelectTab
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Обзор',
      icon: LayoutGrid
    },
    {
      id: 'desktops' as TabType,
      label: 'Столы',
      icon: Layers
    },
    {
      id: 'settings' as TabType,
      label: 'Настройки',
      icon: SlidersHorizontal
    }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4 pb-safe pt-2 bg-white/95 backdrop-blur-2xl border-t sm:border-x sm:rounded-t-3xl border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div className="w-full flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            tab.id === 'desktops'
              ? currentTab === 'desktops'
              : tab.id === 'settings'
              ? currentTab === 'settings'
              : currentTab !== 'desktops' && currentTab !== 'settings';

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-8 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer"
              aria-label={tab.label}
            >
              <div
                className={`relative p-2 rounded-2xl transition-all duration-300 ${
                  isActive ? 'scale-110 shadow-xs' : 'text-[#595959]/70'
                }`}
                style={isActive ? { backgroundColor: `${theme.primary}18` } : undefined}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? theme.primary : '#595959' }}
                />
              </div>

              <span
                className={`text-xs tracking-tight mt-1 transition-colors ${
                  isActive ? 'font-bold' : 'font-semibold text-[#595959]'
                }`}
                style={isActive ? { color: theme.primary } : undefined}
              >
                {tab.label}
              </span>

              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
