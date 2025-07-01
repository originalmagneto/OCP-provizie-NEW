import type { FirmType, FirmTheme } from '../types';

export const defaultFirmThemes: Record<FirmType, FirmTheme> = {
  SKALLARS: {
    primary: '#f3e8ff',
    secondary: '#faf5ff',
    text: '#9333ea',
    border: '#e9d5ff',
    light: '#a855f7',
    accent: '#9333ea',
    logoUrl: '',
  },
  MKMs: {
    primary: '#dbeafe',
    secondary: '#eff6ff',
    text: '#2563eb',
    border: '#bfdbfe',
    light: '#3b82f6',
    accent: '#2563eb',
    logoUrl: '',
  },
  Contax: {
    primary: '#fef9c3',
    secondary: '#fefce8',
    text: '#d97706',
    border: '#fef08a',
    light: '#eab308',
    accent: '#d97706',
    logoUrl: '',
  },
};
