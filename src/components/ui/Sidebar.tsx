import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useYear } from '../../context/YearContext';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Button } from './Button';
import type { FirmType } from '../../types';

interface SidebarProps {
  className?: string;
}

const firmThemes = {
  SKALLARS: {
    primary: 'bg-purple-100',
    secondary: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    light: 'text-purple-500',
    accent: '#9333ea',
    hover: 'hover:bg-purple-200',
  },
  MKMs: {
    primary: 'bg-blue-100',
    secondary: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'text-blue-500',
    accent: '#2563eb',
    hover: 'hover:bg-blue-200',
  },
  Contax: {
    primary: 'bg-yellow-100',
    secondary: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    light: 'text-yellow-500',
    accent: '#d97706',
    hover: 'hover:bg-yellow-200',
  },
} as const;

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

// Compact Quarter Year Selector for Sidebar
function QuarterYearSelectorCompact() {
  const { currentYear, currentQuarter, availableYears, selectYearAndQuarter } = useYear();
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isQuarterOpen, setIsQuarterOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  const quarters = [1, 2, 3, 4];
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
        setIsQuarterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuarterChange = (year: number, quarter: number) => {
    selectYearAndQuarter(year, quarter);
    setIsQuarterOpen(false);
    setIsYearOpen(false);
  };

  return (
    <div className="relative mt-1" ref={selectRef}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setIsYearOpen(!isYearOpen);
            setIsQuarterOpen(false);
          }}
          className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Calendar className="h-3 w-3 mr-1" />
          {currentYear}
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
        <span className="text-xs text-muted-foreground">•</span>
        <button
          onClick={() => {
            setIsQuarterOpen(!isQuarterOpen);
            setIsYearOpen(false);
          }}
          className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Q{currentQuarter}
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
      </div>

      {/* Year dropdown */}
      {isYearOpen && (
        <div className="absolute z-10 mt-1 w-32 rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 animate-slide-down">
          <div className="max-h-48 overflow-auto py-1">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleQuarterChange(year, currentQuarter)}
                className={`w-full text-left px-3 py-1.5 text-xs ${year === currentYear ? 'bg-muted font-medium' : 'hover:bg-muted'}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quarter dropdown */}
      {isQuarterOpen && (
        <div className="absolute z-10 mt-1 left-16 w-24 rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 animate-slide-down">
          <div className="py-1">
            {quarters.map((quarter) => (
              <button
                key={quarter}
                onClick={() => handleQuarterChange(currentYear, quarter)}
                className={`w-full text-left px-3 py-1.5 text-xs ${quarter === currentQuarter ? 'bg-muted font-medium' : 'hover:bg-muted'}`}
              >
                Q{quarter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className = '' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const location = useLocation();

  if (!user) return null;

  const firmTheme = firmThemes[user.firm as FirmType];

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      icon: <FileText size={20} />,
      label: 'Invoices',
      href: '/invoices',
      active: location.pathname === '/invoices',
    },
    {
      icon: <BarChart2 size={20} />,
      label: 'Analytics',
      href: '/analytics',
      active: location.pathname === '/analytics',
    },
    {
      icon: <Users size={20} />,
      label: 'Clients',
      href: '/clients',
      active: location.pathname === '/clients',
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      href: '/settings',
      active: location.pathname === '/settings',
    },
  ];

  const quarterLabel = `Q${currentQuarter} ${currentYear}`;

  return (
    <motion.div
      className={`flex flex-col h-full bg-card border-r border-border ${className}`}
      initial={{ width: collapsed ? 80 : 240 }}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className={`font-semibold text-lg ${firmTheme.text}`}>
            {user.firm}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={collapsed ? 'mx-auto' : ''}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-border">
        {!collapsed ? (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <QuarterYearSelectorCompact />
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className={`w-8 h-8 rounded-full ${firmTheme.primary} flex items-center justify-center ${firmTheme.text} font-semibold`}
            >
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={`flex items-center rounded-md px-3 py-2 transition-colors cursor-pointer ${item.active
                  ? `${firmTheme.primary} ${firmTheme.text}`
                  : 'text-muted-foreground hover:bg-muted'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          onClick={logout}
        >
          <LogOut size={18} className="mr-2" />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </motion.div>
  );
}