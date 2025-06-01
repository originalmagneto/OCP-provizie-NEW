import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DashboardGrid } from './DashboardGrid';
import { DashboardToolbar } from './DashboardToolbar';
import { WidgetSelector } from './WidgetSelector';
import { BarChart3, LineChart, Table2 } from 'lucide-react';
import { WelcomeWidget } from './widgets/WelcomeWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { TableWidget } from './widgets/TableWidget';

type WidgetType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: { w: number; h: number };
  component: React.ComponentType<any>;
  category: string;
};

type Widget = {
  id: string;
  i: string; // For react-grid-layout compatibility
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
  data?: any; // Additional widget data
};

type DashboardProps = {
  initialLayout: Widget[];
  onLayoutChange: (layout: any, allLayouts: any) => void;
};

// Available widget types
const WIDGET_TYPES: WidgetType[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'A welcome message with quick actions',
    icon: <span>👋</span>,
    defaultSize: { w: 4, h: 3 },
    component: WelcomeWidget,
    category: 'general',
  },
  {
    id: 'stats',
    title: 'Statistics',
    description: 'Key metrics and statistics',
    icon: <BarChart3 className="h-4 w-4" />,
    defaultSize: { w: 4, h: 3 },
    component: StatsWidget,
    category: 'analytics',
  },
  {
    id: 'chart',
    title: 'Analytics',
    description: 'Interactive charts and visualizations',
    icon: <LineChart className="h-4 w-4" />,
    defaultSize: { w: 8, h: 6 },
    component: ChartWidget,
    category: 'analytics',
  },
  {
    id: 'table',
    title: 'Transactions',
    description: 'Recent transactions and data',
    icon: <Table2 className="h-4 w-4" />,
    defaultSize: { w: 12, h: 8 },
    component: TableWidget,
    category: 'data',
  },
];

export function Dashboard({ initialLayout, onLayoutChange }: DashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  // Save layout when widgets change
  useEffect(() => {
    onLayoutChange(widgets, { lg: widgets });
  }, [widgets, onLayoutChange]);

  // Add a new widget
  const addWidget = useCallback((widgetType: Omit<WidgetType, 'component'>) => {
    const newWidget: Widget = {
      id: uuidv4(),
      i: uuidv4(),
      title: widgetType.title,
      x: 0,
      y: 0,
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
      minW: 2,
      minH: 2,
      type: widgetType.id,
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetSelector(false);
  }, []);

  // Remove a widget
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  // Toggle edit mode
  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  // Save layout
  const saveLayout = useCallback((layout: any) => {
    const updatedWidgets = layout.map((item: any) => ({
      ...widgets.find(w => w.i === item.i),
      ...item,
    }));
    setWidgets(updatedWidgets);
  }, [widgets]);

  // Handle save
  const handleSave = useCallback(() => {
    setIsEditing(false);
    onLayoutChange(widgets, { lg: widgets });
  }, [widgets, onLayoutChange]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Render widget content based on type
  const renderWidgetContent = useCallback((widget: Widget) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === widget.type);
    if (!widgetType) {
      return (
        <div className="flex h-full items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Widget type "{widget.type}" not found
          </p>
        </div>
      );
    }
    
    const WidgetComponent = widgetType.component;
    return <WidgetComponent className="h-full w-full" {...(widget.data || {})} />;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <DashboardToolbar
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAddWidget={() => setShowWidgetSelector(true)}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <DashboardGrid
          isEditing={isEditing}
          items={widgets.map(widget => ({
            ...widget,
            content: renderWidgetContent(widget)
          }))}
          onRemoveItem={removeWidget}
          onLayoutChange={saveLayout}
        />
      </div>

      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        onSelect={addWidget}
        availableWidgets={WIDGET_TYPES}
      />
    </div>
  );
}

// Default export with local storage integration
export function DashboardWithLocalStorage() {
  // Load saved layout or use default
  const [initialLayout] = useState<Widget[]>(() => {
    try {
      const saved = localStorage.getItem('dashboard-layout');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load dashboard layout', e);
      return [];
    }
  });

  // Save layout to localStorage whenever it changes
  const handleLayoutChange = useCallback((layout: Widget[]) => {
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
  }, []);

  return (
    <Dashboard 
      initialLayout={initialLayout} 
      onLayoutChange={handleLayoutChange} 
    />
  );
}
