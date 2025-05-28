import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Theme, useTheme } from './theme';

type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const theme = useTheme(user?.firm || 'SKALLARS');

  const value = useMemo(() => ({
    theme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div 
        style={{
          '--color-primary': theme.colors.primary,
          '--color-primary-light': theme.colors.primaryLight,
          '--color-primary-dark': theme.colors.primaryDark,
          '--color-secondary': theme.colors.secondary,
          '--color-accent': theme.colors.accent,
          '--color-background': theme.colors.background,
          '--color-card': theme.colors.card,
          '--color-text': theme.colors.text,
          '--color-text-secondary': theme.colors.textSecondary,
          '--color-border': theme.colors.border,
          '--color-success': theme.colors.success,
          '--color-error': theme.colors.error,
          '--color-warning': theme.colors.warning,
          '--color-info': theme.colors.info,
          '--shadow-sm': theme.shadows.sm,
          '--shadow-md': theme.shadows.md,
          '--shadow-lg': theme.shadows.lg,
          '--radius-sm': theme.borderRadius.sm,
          '--radius-md': theme.borderRadius.md,
          '--radius-lg': theme.borderRadius.lg,
          '--radius-full': theme.borderRadius.full,
          '--transition-fast': theme.transitions.fast,
          '--transition-normal': theme.transitions.normal,
          '--transition-slow': theme.transitions.slow,
        } as React.CSSProperties}
        className="min-h-screen bg-background text-text"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
