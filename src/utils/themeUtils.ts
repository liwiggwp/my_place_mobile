import type { AppThemeSettings, DualColorTheme } from '../types';

export const defaultGlobalTheme: DualColorTheme = {
  primary: '#203A5F',
  secondary: '#595959'
};

export const defaultThemeSettings: AppThemeSettings = {
  global: defaultGlobalTheme
};

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  category?: 'classic' | 'pastel' | 'vibrant' | 'dark';
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'myplace', name: 'MyPlace Classic', primary: '#203A5F', secondary: '#595959', category: 'classic' },
  { id: 'sapphire_ocean', name: 'Сапфир & Океан', primary: '#1e3a8a', secondary: '#0284c7', category: 'classic' },
  { id: 'sakura_rose', name: 'Сакура & Роза', primary: '#be123c', secondary: '#fb7185', category: 'pastel' },
  { id: 'emerald_mint', name: 'Изумруд & Мята', primary: '#047857', secondary: '#10b981', category: 'vibrant' },
  { id: 'lavender_violet', name: 'Лаванда & Аметист', primary: '#6d28d9', secondary: '#a855f7', category: 'pastel' },
  { id: 'sunset_coral', name: 'Закат & Коралл', primary: '#c2410c', secondary: '#fb923c', category: 'vibrant' },
  { id: 'obsidian_slate', name: 'Обсидиан & Графит', primary: '#0f172a', secondary: '#475569', category: 'dark' },
  { id: 'mocha_latte', name: 'Мокко & Какао', primary: '#451a03', secondary: '#78350f', category: 'classic' },
  { id: 'berry_wine', name: 'Ягодный Винтаж', primary: '#831843', secondary: '#db2777', category: 'vibrant' }
];

export const getScreenTheme = (
  themeSettings: AppThemeSettings | undefined,
  screenKey: 'global' | 'cycle' | 'water' | 'pills'
): DualColorTheme => {
  const global = themeSettings?.global || defaultGlobalTheme;
  if (screenKey === 'global') return global;

  const override = themeSettings?.[screenKey];
  if (override && override.primary && override.secondary) {
    return override;
  }
  return global;
};

export const getThemeGradientStyle = (theme: DualColorTheme): React.CSSProperties => {
  return {
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
    color: '#ffffff'
  };
};

export const getThemeShadowStyle = (theme: DualColorTheme): React.CSSProperties => {
  return {
    boxShadow: `0 10px 25px -5px ${theme.primary}40, 0 8px 10px -6px ${theme.secondary}30`
  };
};
