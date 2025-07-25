export const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "text-purple-500",
    accent: "#9333ea",
    bg: "bg-purple-50",
    hover: "hover:bg-purple-100",
    chartPrimary: "#9333ea",
    chartSecondary: "#a855f7",
    chartTertiary: "#c084fc",
    chartLight: "#f3e8ff",
    gradient: "from-purple-50 to-purple-100",
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "text-blue-500",
    accent: "#2563eb",
    bg: "bg-blue-50",
    hover: "hover:bg-blue-100",
    chartPrimary: "#2563eb",
    chartSecondary: "#3b82f6",
    chartTertiary: "#60a5fa",
    chartLight: "#e0f2fe",
    gradient: "from-gray-50 to-gray-100",
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    light: "text-yellow-500",
    accent: "#d97706",
    bg: "bg-yellow-50",
    hover: "hover:bg-yellow-100",
    chartPrimary: "#d97706",
    chartSecondary: "#f59e0b",
    chartTertiary: "#fbbf24",
    chartLight: "#fef3c7",
    gradient: "from-yellow-50 to-yellow-100",
  },
} as const;

export type FirmThemes = typeof firmThemes;
export type FirmTheme = FirmThemes[keyof FirmThemes];

import type { FirmType, FirmTheme } from '../types';
