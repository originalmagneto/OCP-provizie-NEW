import { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';

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

const DEFAULT_LAYOUT: Layout = {
  lg: [
    {
      i: 'welcome-1',
      id: 'welcome-1',
      title: 'Welcome',
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
      type: 'welcome',
    },
    {
      i: 'stats-1',
      id: 'stats-1',
      title: 'Statistics',
      x: 4,
      y: 0,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
      type: 'stats',
    },
    {
      i: 'chart-1',
      id: 'chart-1',
      title: 'Performance',
      x: 0,
      y: 3,
      w: 8,
      h: 5,
      minW: 4,
      minH: 4,
      type: 'chart',
    },
  ],
  md: [],
  sm: [],
  xs: [],
  xxs: [],
};

export function DashboardLayout() {
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

  return (
    <Dashboard
      initialLayout={layout}
      onLayoutChange={handleLayoutChange}
    />
  );
}
