import type { FirmType } from "../types";

export const firmStyles: Record<FirmType, {
  bg: string;
  bgLight: string;
  border: string;
  text: string;
  hover: string;
  accent: string;
  lightText: string;
  gradient?: string;
  chartColors: { primary: string; secondary: string; tertiary: string; light: string };
}> = {
  SKALLARS: {
    bg: "bg-purple-50",
    bgLight: "bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-600",
    hover: "hover:bg-purple-100",
    accent: "#9333ea",
    lightText: "text-purple-500",
    gradient: "from-purple-50 to-purple-100",
    chartColors: {
      primary: "#9333ea",
      secondary: "#a855f7",
      tertiary: "#c084fc",
      light: "#f3e8ff",
    },
  },
  MKMs: {
    bg: "bg-blue-50",
    bgLight: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-600",
    hover: "hover:bg-blue-100",
    accent: "#2563eb",
    lightText: "text-blue-500",
    gradient: "from-gray-50 to-gray-100",
    chartColors: {
      primary: "#2563eb",
      secondary: "#3b82f6",
      tertiary: "#60a5fa",
      light: "#e0f2fe",
    },
  },
  Contax: {
    bg: "bg-yellow-50",
    bgLight: "bg-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-600",
    hover: "hover:bg-yellow-100",
    accent: "#d97706",
    lightText: "text-yellow-500",
    gradient: "from-yellow-50 to-yellow-100",
    chartColors: {
      primary: "#d97706",
      secondary: "#f59e0b",
      tertiary: "#fbbf24",
      light: "#fef3c7",
    },
  },
};
