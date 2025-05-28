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
  const addWidget = useCallback((widgetType: WidgetType) => {
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
    if (!widgetType) return null;
    
    const WidgetComponent = widgetType.component;
    return <WidgetComponent className="h-full w-full" {...(widget.data || {})} />;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <DashboardToolbar
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onAddWidget={() => setShowWidgetSelector(true)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <DashboardGrid
          isEditing={isEditing}
          items={widgets}
          onRemoveItem={removeWidget}
          onLayoutChange={saveLayout}
          renderItem={renderWidgetContent}
        />
      </div>

      <WidgetSelector
        open={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onSelect={(widget) => addWidget(widget as WidgetType)}
        widgetTypes={WIDGET_TYPES.map(({ component, ...rest }) => rest)}
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
  const addWidget = useCallback((widgetType: WidgetType) => {
    const newWidget: Widget = {
      id: uuidv4(),
      i: uuidv4(), // For react-grid-layout compatibility
      title: widgetType.title,
      x: 0,
      y: 0, // Add to the bottom
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
      minW: 2,
      minH: 2,
      type: widgetType.id,
    };
    
    setWidgets(prev => [...prev, newWidget]);
  }, []);
  
  // Remove a widget
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);
  
  // Toggle edit mode
  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);
  
  // Save the current layout
  const saveLayoutAndExit = useCallback(() => {
    // The layout is already being saved in saveLayout
    setIsEditing(false);
  }, []);
  
  // Cancel editing
  const cancelEditing = useCallback(() => {
    // Reload the saved layout
    try {
      const saved = localStorage.getItem('dashboard-layout');
      if (saved) {
        setWidgets(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to reload saved layout', e);
    }
    setIsEditing(false);
  }, []);
  
  // Render widget content based on type
  const renderWidgetContent = useCallback((widget: Widget) => {
    const widgetType = WIDGET_TYPES.find(wt => wt.id === widget.type);
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
    return <WidgetComponent />;
  }, []);
  
  // Prepare items for the grid
  const gridItems = useMemo(() => {
    return widgets.map(widget => ({
      ...widget,
      content: (
        <Card className="h-full w-full">
          {renderWidgetContent(widget)}
        </Card>
      ),
    }));
  }, [widgets, renderWidgetContent]);
  
  return (
    <div className="flex h-full w-full flex-col">
      <DashboardToolbar
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onSave={saveLayoutAndExit}
        onCancel={cancelEditing}
        onAddWidget={() => setShowWidgetSelector(true)}
      />
      
      <div className="flex-1 overflow-auto p-4">
        {widgets.length === 0 && !isEditing ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No widgets added</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Get started by adding your first widget to the dashboard
            </p>
            <Button
              onClick={() => setShowWidgetSelector(true)}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </div>
        ) : (
          <DashboardGrid
            items={gridItems}
            onLayoutChange={saveLayout}
            isEditing={isEditing}
            onAddItem={() => setShowWidgetSelector(true)}
            onRemoveItem={removeWidget}
            className="h-full min-h-[600px]"
          />
        )}
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
