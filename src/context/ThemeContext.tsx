import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { firmServices } from '../services/firmServices';
import { firmThemes } from '../config/themes';
import type { FirmTheme } from '../types';

interface ThemeContextType {
  theme: FirmTheme | null;
  refresh: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  refresh: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<FirmTheme | null>(null);

  const loadTheme = async () => {
    if (user) {
      const cfg = await firmServices.getFirmConfig(user.firm);
      const merged = { ...firmThemes[user.firm], ...(cfg || {}) };
      setTheme(merged);
    }
  };

  useEffect(() => {
    loadTheme();
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, refresh: loadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
