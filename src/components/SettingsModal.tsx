import React, { useState } from 'react';
import {
  X,
  Upload,
  Palette,
  Layout,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { getFirmBranding } from '../config/firmBranding';
import type { FirmType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (settings: SettingsData) => void;
}

interface SettingsData {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  dashboardCards: {
    totalRevenue: boolean;
    commissionsToReceive: boolean;
    commissionsToPay: boolean;
    pendingInvoices: boolean;
    allTimeRevenue: boolean;
    allTimeCommissions: boolean;
    quarterlyOverview: boolean;
    kpiCards: boolean;
    performanceMetrics: boolean;
    allTimeSummary: boolean;
  };
}

const defaultColors = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  accent: '#10B981'
};

const defaultDashboardCards = {
  totalRevenue: true,
  commissionsToReceive: true,
  commissionsToPay: true,
  pendingInvoices: true,
  allTimeRevenue: true,
  allTimeCommissions: true,
  quarterlyOverview: true,
  kpiCards: true,
  performanceMetrics: true,
  allTimeSummary: true
};

export default function SettingsModal({ isOpen, onClose, user, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'dashboard'>('appearance');
  const [settings, setSettings] = useState<SettingsData>({
    colors: defaultColors,
    dashboardCards: defaultDashboardCards
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const firmBranding = getFirmBranding(user.firm as FirmType);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setSettings(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorType: keyof typeof defaultColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }));
  };

  const handleCardToggle = (cardType: keyof typeof defaultDashboardCards) => {
    setSettings(prev => ({
      ...prev,
      dashboardCards: {
        ...prev.dashboardCards,
        [cardType]: !prev.dashboardCards[cardType]
      }
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      colors: defaultColors,
      dashboardCards: defaultDashboardCards
    });
    setLogoPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Palette className="h-5 w-5" />
                <span className="font-medium">Appearance</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Layout className="h-5 w-5" />
                <span className="font-medium">Dashboard Cards</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                {/* Logo Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <div className="h-16 w-16">
                          <firmBranding.logo className="h-full w-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Recommended: 200x200px, PNG or SVG</p>
                    </div>
                  </div>
                </div>

                {/* Colors Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Preview</h4>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <button
                        style={{ backgroundColor: settings.colors.primary }}
                        className="px-4 py-2 text-white rounded-lg font-medium"
                      >
                        Primary Button
                      </button>
                      <button
                        style={{ backgroundColor: settings.colors.secondary }}
                        className="px-4 py-2 text-white rounded-lg font-medium"
                      >
                        Secondary Button
                      </button>
                      <button
                        style={{ backgroundColor: settings.colors.accent }}
                        className="px-4 py-2 text-white rounded-lg font-medium"
                      >
                        Accent Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Information Cards</h3>
                  <p className="text-gray-600 mb-6">Choose which information cards to display on your dashboard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.dashboardCards).map(([key, enabled]) => {
                    const cardLabels: Record<string, string> = {
                      totalRevenue: 'Total Revenue',
                      commissionsToReceive: 'Commissions to Receive',
                      commissionsToPay: 'Commissions to Pay',
                      pendingInvoices: 'Pending Invoices',
                      allTimeRevenue: 'All-Time Revenue',
                      allTimeCommissions: 'All-Time Commissions',
                      quarterlyOverview: 'Quarterly Overview'
                    };

                    return (
                      <div
                        key={key}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          enabled
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleCardToggle(key as keyof typeof defaultDashboardCards)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {enabled ? (
                              <Eye className="h-5 w-5 text-blue-600" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            )}
                            <span className={`font-medium ${
                              enabled ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {cardLabels[key]}
                            </span>
                          </div>
                          <div className={`w-4 h-4 rounded border-2 ${
                            enabled
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {enabled && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Default</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { SettingsData };