import { useState, useEffect } from 'react';
import { DashboardWithLocalStorage } from './Dashboard';
import { Sidebar } from '../ui/Sidebar';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <DashboardWithLocalStorage />
      </div>
    </div>
  );
}
