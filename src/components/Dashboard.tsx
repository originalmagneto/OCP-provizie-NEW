import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import { 
  Trash2, 
  AlertTriangle, 
  Plus, 
  Download
} from "lucide-react";
import Sidebar from "./Sidebar";
import MainContent, { HeaderActionButton } from "./MainContent";
import DashboardOverview from "./DashboardOverview";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";
import QuarterlyCommissions from "./QuarterlyCommissions";
import UserManagement from "./UserManagement";
import CalendarView from "./CalendarView";
import ReferralOverview from "./ReferralOverview";
import { getFirmBranding } from "../config/firmBranding";
import type { SettingsData } from "./SettingsModal";
import type { FirmType } from "../types";

function InvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create New Invoice</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <InvoiceForm onSuccess={onClose} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { invoices } = useInvoices();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customSettings, setCustomSettings] = useState<SettingsData | null>(null);

  const handleSettingsChange = (settings: SettingsData) => {
    setCustomSettings(settings);
    // Store in localStorage for persistence
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  };

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        setCustomSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Get current tab title and subtitle
  const getTabInfo = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return { title: 'Dashboard Overview', subtitle: `${user?.firm} commission management portal` };
      case 1:
        return { title: 'All Invoices', subtitle: 'Complete invoice management and tracking' };
      case 2:
        return { title: 'Create New Invoice', subtitle: 'Add a new invoice to the system' };
      case 3:
        return { title: 'Pending Payments', subtitle: 'Track outstanding invoice payments' };
      case 4:
        return { title: 'Commission Settlement', subtitle: 'Manage quarterly commission settlements' };
      case 5:
        return { title: 'Analytics & Reports', subtitle: 'Performance insights and data visualization' };
      case 6:
        return { title: 'User Management', subtitle: 'Manage firm users and permissions' };
      case 7:
        return { title: 'Calendar View', subtitle: 'Commission events and settlement calendar' };
      case 8:
        return { title: 'Referral Overview', subtitle: 'Track and manage your referred firms' };
      default:
        return { title: 'Dashboard', subtitle: 'Commission management portal' };
    }
  };

  // Render tab content based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <DashboardOverview customSettings={customSettings || undefined} />;
      case 1:
        return <InvoiceList />;
      case 2:
        return (
          <div className="max-w-2xl">
            <InvoiceForm onSuccess={() => setSelectedTab(1)} />
          </div>
        );
      case 3:
        return <UnpaidInvoicesList />;
      case 4:
        return <QuarterlyCommissions />;
      case 5:
        return <DashboardCharts />;
      case 6:
        return <UserManagement />;
      case 7:
        return <CalendarView />;
      case 8:
        return <ReferralOverview user={user} />;
      default:
        return <DashboardOverview customSettings={customSettings || undefined} />;
    }
  };

  if (!user) return null;

  const firmBranding = getFirmBranding(user.firm as FirmType);
  const { title, subtitle } = getTabInfo(selectedTab);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        user={user}
        onLogout={logout}
        onSettingsChange={handleSettingsChange}
      />

      {/* Main Content Area */}
      <MainContent
        user={user}
        title={title}
        subtitle={subtitle}
        showSearch={selectedTab === 1 || selectedTab === 3 || selectedTab === 8}
        showFilters={selectedTab === 1 || selectedTab === 5}
        customSettings={customSettings}
        actions={
          <div className="flex items-center space-x-2">
            <HeaderActionButton
              icon={<Plus className="h-4 w-4" />}
              label="Create Invoice"
              onClick={() => setShowInvoiceModal(true)}
              variant="primary"
              firmBranding={firmBranding}
            />
            <HeaderActionButton
              icon={<Download className="h-4 w-4" />}
              label="Export Data"
              onClick={() => {
                // Export functionality placeholder
                alert('Export functionality will be implemented here');
              }}
              variant="secondary"
            />
            <HeaderActionButton
              icon={<Trash2 className="h-4 w-4" />}
              label="Reset Data"
              onClick={() => setShowResetConfirmation(true)}
              variant="secondary"
            />
          </div>
        }
      >
        <div style={customSettings?.colors ? {
          '--primary-color': customSettings.colors.primary,
          '--secondary-color': customSettings.colors.secondary,
          '--accent-color': customSettings.colors.accent
        } as React.CSSProperties : {}}>
          {renderTabContent()}
        </div>
      </MainContent>

      {/* Modals */}
      <InvoiceModal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} />

      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Reset All Data
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset all data? This action cannot be
                  undone and will delete all invoices and commission records.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement reset functionality
                    setShowResetConfirmation(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
