import { FirmType } from "../types";

export type Theme = {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
};

export const baseTheme: Omit<Theme, 'colors'> = {
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  transitions: {
    fast: 'all 0.15s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out'
  }
};

export const themes: Record<FirmType, Theme> = {
  SKALLARS: {
    ...baseTheme,
    colors: {
      primary: '#7e22ce',
      primaryLight: '#a855f7',
      primaryDark: '#6b21a8',
      secondary: '#f5f3ff',
      accent: '#9333ea',
      background: '#f9fafb',
      card: '#ffffff',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#e5e7eb',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  },
  MKMs: {
    ...baseTheme,
    colors: {
      primary: '#1d4ed8',
      primaryLight: '#3b82f6',
      primaryDark: '#1e40af',
      secondary: '#eff6ff',
      accent: '#2563eb',
      background: '#f9fafb',
      card: '#ffffff',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#e5e7eb',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  },
  Contax: {
    ...baseTheme,
    colors: {
      primary: '#b45309',
      primaryLight: '#f59e0b',
      primaryDark: '#92400e',
      secondary: '#fffbeb',
      accent: '#d97706',
      background: '#f9fafb',
      card: '#ffffff',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#e5e7eb',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  }
};

export const useTheme = (firm: FirmType): Theme => {
  return themes[firm];
};
