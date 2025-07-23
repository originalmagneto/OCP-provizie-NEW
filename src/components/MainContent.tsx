import React from 'react';
import { 
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { getFirmBranding } from '../config/firmBranding';
import type { SettingsData } from './SettingsModal';
import type { FirmType } from '../types';

interface MainContentProps {
  user: any;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  showFilters?: boolean;
  customSettings?: SettingsData | null;
}

export default function MainContent({ 
  user, 
  children, 
  title, 
  subtitle, 
  actions, 
  showSearch = false, 
  showFilters = false,
  customSettings
}: MainContentProps) {
  if (!user) return null;

  const firmBranding = getFirmBranding(user.firm as FirmType);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Apply custom colors if available
  const primaryColor = customSettings?.colors?.primary || '#3B82F6';
  const secondaryColor = customSettings?.colors?.secondary || '#6B7280';
  const accentColor = customSettings?.colors?.accent || '#10B981';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent w-64"
                  style={{
                    '--tw-ring-color': primaryColor,
                    focusRingColor: primaryColor
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
            )}

            {/* Filter Button */}
            {showFilters && (
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>
            )}

            {/* Action Buttons */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}

            {/* Notifications */}
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                // Show notification dropdown or modal
                alert('Notifications:\n\n• Commission settlement due for Q3 2024\n• 3 pending invoice payments\n• New referral from Partner Firm');
              }}
              title="View notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{currentDate}</p>
              </div>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Quick Action Button Component for the header
export function HeaderActionButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'secondary',
  firmBranding
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  firmBranding?: any;
}) {
  const baseClasses = "flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-0";
  const variantClasses = variant === 'primary' && firmBranding
    ? `${firmBranding.theme.button.primary.bg} ${firmBranding.theme.button.primary.text} ${firmBranding.theme.button.primary.hover} focus:ring-2 focus:ring-offset-2 shadow-sm`
    : variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm"
    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500";

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      title={label}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-xs font-medium truncate">{label}</span>
    </button>
  );
}

// Stats Card Component for dashboard content
export function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'blue'
}: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change && trend && (
          <div className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

// Content Section Component
export function ContentSection({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className = '' 
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}