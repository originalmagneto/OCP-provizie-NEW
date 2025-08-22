import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  FileText,
  Plus,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { getFirmBranding } from '../config/firmBranding';
import SettingsModal, { type SettingsData } from './SettingsModal';
import FirmLogo from './FirmLogo';
import { firmServices } from '../services/firmServices';
import type { FirmType, FirmTheme } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: number;
  onTabChange: (index: number) => void;
  user: any;
  onLogout: () => void;
  onSettingsChange?: (settings: SettingsData) => void;
}

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  badge?: string;
  color?: string;
}

const getNavigationItems = (userRole?: string): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      id: 0,
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      id: 1,
      name: 'All Invoices',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-gray-600'
    },
    {
      id: 2,
      name: 'Create New',
      icon: <Plus className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      id: 3,
      name: 'Pending Payments',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      id: 4,
      name: 'Commission Settlement',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      id: 5,
      name: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-indigo-600'
    },
    {
      id: 7,
      name: 'Calendar View',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-teal-600'
    },
    {
      id: 8,
      name: 'Referral Overview',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'text-emerald-600'
    }
  ];

  // Add User Management for admin users
  if (userRole === 'admin') {
    baseItems.push({
      id: 6,
      name: 'User Management',
      icon: <Users className="h-5 w-5" />,
      color: 'text-cyan-600'
    });
  }

  return baseItems;
};

export default function Sidebar({ 
  isCollapsed, 
  onToggle, 
  activeTab, 
  onTabChange, 
  user, 
  onLogout,
  onSettingsChange
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [firmTheme, setFirmTheme] = useState<FirmTheme | null>(null);
  
  if (!user) return null;

  const firmBranding = getFirmBranding(user.firm as FirmType);
  
  // Load firm theme on component mount
  useEffect(() => {
    const loadFirmTheme = async () => {
      try {
        const theme = await firmServices.getFirmConfig(user.firm as FirmType);
        setFirmTheme(theme);
      } catch (error) {
        console.error('Error loading firm theme:', error);
      }
    };
    
    loadFirmTheme();
  }, [user.firm]);

  const handleSettingsSave = async (settings: SettingsData) => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    setIsSettingsOpen(false);
    
    // Refresh firm theme after settings save
    try {
      const updatedTheme = await firmServices.getFirmConfig(user.firm as FirmType);
      setFirmTheme(updatedTheme);
    } catch (error) {
      console.error('Error refreshing firm theme:', error);
    }
  };

  return (
    <div id="sidebar" className={`relative bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen`}>
      {/* Header */}
      <div className={`flex items-center border-b border-gray-200 ${isCollapsed ? 'flex-col p-2 space-y-2' : 'justify-between p-4'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 flex-shrink-0">
              <FirmLogo 
                 firm={user.firm as FirmType} 
                 className="h-full w-full" 
                 customTheme={firmTheme || undefined} 
               />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {firmBranding.displayName}
              </h1>
              <p className="text-xs text-gray-500">Commission Portal</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
            <FirmLogo 
               firm={user.firm as FirmType} 
               className="h-8 w-8" 
               customTheme={firmTheme || undefined} 
             />
          </div>
        )}
        
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${isCollapsed ? 'w-full' : ''}`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 mx-auto" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>



      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {getNavigationItems(user.role).map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center transition-all duration-200 group rounded-lg ${
                isCollapsed 
                  ? 'justify-center p-3 h-12 w-12 mx-auto' 
                  : 'space-x-3 px-4 py-3'
              } ${
                isActive
                  ? `${firmBranding.theme.button.primary.bg} ${firmBranding.theme.button.primary.text} shadow-sm`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`flex-shrink-0 ${
                isActive ? '' : item.color
              }`}>
                {item.icon}
              </div>
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats (when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-sm font-semibold text-gray-900">€12.5K</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-sm font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {!isCollapsed && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        )}
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Sign Out</span>
          )}
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSave={handleSettingsSave}
      />
    </div>
  );
}