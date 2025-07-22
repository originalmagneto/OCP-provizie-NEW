import React from 'react';
import type { FirmType } from '../types';

// SVG Logo Components for each firm
export const SkallarsLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
    <path d="M30 35 L50 25 L70 35 L70 55 L50 65 L30 55 Z" fill="white" stroke="#8B5CF6" strokeWidth="2"/>
    <circle cx="50" cy="45" r="8" fill="#8B5CF6"/>
    <text x="50" y="80" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">S</text>
  </svg>
);

export const MKMsLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="80" height="80" rx="12" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <path d="M25 35 L40 25 L55 35 L70 25 L75 35 L75 65 L70 75 L55 65 L40 75 L25 65 Z" fill="white"/>
    <text x="50" y="80" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">MKM</text>
  </svg>
);

export const ContaxLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
    <circle cx="50" cy="50" r="20" fill="white"/>
    <path d="M40 45 L50 35 L60 45 L55 50 L60 55 L50 65 L40 55 L45 50 Z" fill="#F59E0B"/>
    <text x="50" y="85" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">CTX</text>
  </svg>
);

export interface FirmBranding {
  name: string;
  displayName: string;
  logo: React.ComponentType<{ className?: string }>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
    gradient: string;
    hover: string;
    light: string;
    dark: string;
  };
  theme: {
    // Tailwind classes for consistent theming
    card: {
      bg: string;
      border: string;
    };
    button: {
      primary: {
        bg: string;
        text: string;
        hover: string;
      };
      secondary: {
        bg: string;
        text: string;
        hover: string;
      };
    };
    badge: {
      bg: string;
      text: string;
    };
    header: {
      bg: string;
      border: string;
      text: string;
    };
    sidebar: {
      bg: string;
      border: string;
    };
  };
}

export const firmBranding: Record<FirmType, FirmBranding> = {
  SKALLARS: {
    name: 'SKALLARS',
    displayName: 'Skallars',
    logo: SkallarsLogo,
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#7C3AED',
      text: '#5B21B6',
      background: '#F3F4F6',
      border: '#C4B5FD',
      gradient: 'from-purple-50 to-purple-100',
      hover: '#7C3AED',
      light: '#EDE9FE',
      dark: '#5B21B6'
    },
    theme: {
      card: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200'
      },
      button: {
        primary: {
          bg: 'bg-purple-600',
          text: 'text-white',
          hover: 'hover:bg-purple-700'
        },
        secondary: {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          hover: 'hover:bg-purple-200'
        }
      },
      badge: {
        bg: 'bg-purple-100',
        text: 'text-purple-800'
      },
      header: {
        bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
        border: 'border-purple-200',
        text: 'text-white'
      },
      sidebar: {
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      }
    }
  },
  MKMs: {
    name: 'MKMs',
    displayName: 'MKMs',
    logo: MKMsLogo,
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#1F2937',
      text: '#111827',
      background: '#F9FAFB',
      border: '#D1D5DB',
      gradient: 'from-gray-50 to-gray-100',
      hover: '#1F2937',
      light: '#F3F4F6',
      dark: '#111827'
    },
    theme: {
      card: {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200'
      },
      button: {
        primary: {
          bg: 'bg-gray-600',
          text: 'text-white',
          hover: 'hover:bg-gray-700'
        },
        secondary: {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          hover: 'hover:bg-gray-200'
        }
      },
      badge: {
        bg: 'bg-gray-100',
        text: 'text-gray-800'
      },
      header: {
        bg: 'bg-gradient-to-r from-gray-600 to-gray-700',
        border: 'border-gray-200',
        text: 'text-white'
      },
      sidebar: {
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      }
    }
  },
  Contax: {
    name: 'Contax',
    displayName: 'Contax',
    logo: ContaxLogo,
    colors: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#D97706',
      text: '#92400E',
      background: '#FFFBEB',
      border: '#FCD34D',
      gradient: 'from-amber-50 to-amber-100',
      hover: '#D97706',
      light: '#FEF3C7',
      dark: '#92400E'
    },
    theme: {
      card: {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        border: 'border-amber-200'
      },
      button: {
        primary: {
          bg: 'bg-amber-600',
          text: 'text-white',
          hover: 'hover:bg-amber-700'
        },
        secondary: {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          hover: 'hover:bg-amber-200'
        }
      },
      badge: {
        bg: 'bg-amber-100',
        text: 'text-amber-800'
      },
      header: {
        bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
        border: 'border-amber-200',
        text: 'text-white'
      },
      sidebar: {
        bg: 'bg-amber-50',
        border: 'border-amber-200'
      }
    }
  }
};

// Helper function to get firm branding
export const getFirmBranding = (firm: FirmType): FirmBranding => {
  return firmBranding[firm];
};

// Helper function to get firm logo component
export const getFirmLogo = (firm: FirmType) => {
  return firmBranding[firm].logo;
};

// Helper function to get firm colors
export const getFirmColors = (firm: FirmType) => {
  return firmBranding[firm].colors;
};

// Helper function to get firm theme classes
export const getFirmTheme = (firm: FirmType) => {
  return firmBranding[firm].theme;
};