import { useState, useEffect } from 'react';
import { Sidebar } from '../ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard';
import { InvoicesPage } from '../pages/Invoices';
import { AnalyticsPage } from '../pages/Analytics';
import { ClientsPage } from '../pages/Clients';
import { SettingsPage } from '../pages/Settings';

type Widget = {
  id: string;
  i: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  type: string;
};

type Layout = {
  lg: Widget[];
  md: Widget[];
  sm: Widget[];
  xs: Widget[];
  xxs: Widget[];
};

// Default layout with initial widgets
const DEFAULT_LAYOUT: Layout = {
  lg: [
    {
      id: 'welcome',
      i: 'welcome',
      title: 'Welcome',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      type: 'welcome',
    },
    {
      id: 'stats',
      i: 'stats',
      title: 'Statistics',
      x: 4,
      y: 0,
      w: 4,
      h: 3,
      type: 'stats',
    },
    {
      id: 'chart',
      i: 'chart',
      title: 'Performance',
      x: 0,
      y: 3,
      w: 8,
      h: 6,
      type: 'chart',
    },
  ],
  md: [
    { id: 'welcome', i: 'welcome', title: 'Welcome', x: 0, y: 0, w: 6, h: 3, type: 'welcome' },
    { id: 'stats', i: 'stats', title: 'Statistics', x: 6, y: 0, w: 6, h: 3, type: 'stats' },
    { id: 'chart', i: 'chart', title: 'Performance', x: 0, y: 3, w: 12, h: 6, type: 'chart' },
  ],
  sm: [
    { id: 'welcome', i: 'welcome', title: 'Welcome', x: 0, y: 0, w: 6, h: 3, type: 'welcome' },
    { id: 'stats', i: 'stats', title: 'Statistics', x: 0, y: 3, w: 6, h: 3, type: 'stats' },
    { id: 'chart', i: 'chart', title: 'Performance', x: 0, y: 6, w: 6, h: 6, type: 'chart' },
  ],
  xs: [
    { id: 'welcome', i: 'welcome', title: 'Welcome', x: 0, y: 0, w: 4, h: 3, type: 'welcome' },
    { id: 'stats', i: 'stats', title: 'Statistics', x: 0, y: 3, w: 4, h: 3, type: 'stats' },
    { id: 'chart', i: 'chart', title: 'Performance', x: 0, y: 6, w: 4, h: 6, type: 'chart' },
  ],
  xxs: [
    { id: 'welcome', i: 'welcome', title: 'Welcome', x: 0, y: 0, w: 2, h: 3, type: 'welcome' },
    { id: 'stats', i: 'stats', title: 'Statistics', x: 0, y: 3, w: 2, h: 3, type: 'stats' },
    { id: 'chart', i: 'chart', title: 'Performance', x: 0, y: 6, w: 2, h: 6, type: 'chart' },
  ],
};

export function DashboardLayout() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<Layout>(() => {
    try {
      const saved = localStorage.getItem('dashboard-layout');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch (e) {
      console.error('Failed to load dashboard layout', e);
      return DEFAULT_LAYOUT;
    }
  });

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-layout', JSON.stringify(layout));
    } catch (e) {
      console.error('Failed to save dashboard layout', e);
    }
  }, [layout]);

  const handleLayoutChange = (newLayout: any, allLayouts: any) => {
    setLayout(allLayouts);
  };

  if (!user) return null;

  const location = useLocation();
  
  // Determine which component to render based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/invoices') {
      return <InvoicesPage />;
    } else if (path === '/analytics') {
      return <AnalyticsPage />;
    } else if (path === '/clients') {
      return <ClientsPage />;
    } else if (path === '/settings') {
      return <SettingsPage />;
    } else {
      // Default to dashboard for '/' and '/dashboard'
      return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
