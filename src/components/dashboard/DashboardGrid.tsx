import React, { useCallback, useState } from 'react';
import { Responsive, WidthProvider, Layouts, Layout } from 'react-grid-layout';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Plus, GripVertical, X } from 'lucide-react';
import { GridItem } from '../ui/GridItem';

const ResponsiveGridLayout = WidthProvider(Responsive);

type DashboardItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  title?: string;
  content: React.ReactNode;
};

type DashboardGridProps = {
  className?: string;
  items: DashboardItem[];
  onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
  onAddItem?: () => void;
  onRemoveItem?: (id: string) => void;
  onEditItem?: (id: string) => void;
  isEditing?: boolean;
  rowHeight?: number;
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  breakpoints?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  containerPadding?: [number, number];
  margin?: [number, number];
  compactType?: 'vertical' | 'horizontal' | null;
};

export function DashboardGrid({
  className,
  items = [],
  onLayoutChange,
  onAddItem,
  onRemoveItem,
  onEditItem,
  isEditing = false,
  rowHeight = 30,
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  containerPadding = [16, 16],
  margin = [16, 16],
  compactType = 'vertical',
}: DashboardGridProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleLayoutChange = useCallback(
    (layout: Layout[], layouts: Layouts) => {
      if (onLayoutChange) {
        onLayoutChange(layout, layouts);
      }
    },
    [onLayoutChange]
  );

  const handleRemoveItem = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemoveItem) {
        onRemoveItem(id);
      }
    },
    [onRemoveItem]
  );

  const handleEditItem = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEditItem) {
        onEditItem(id);
      }
    },
    [onEditItem]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Convert items to layout format expected by react-grid-layout
  const layout = items.map(item => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
    static: item.static
  }));

  return (
    <div className={cn('relative h-full w-full', className)}>
      <ResponsiveGridLayout
        className={cn('min-h-[500px]', { 'cursor-grabbing': isDragging })}
        layouts={{ lg: layout }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        containerPadding={containerPadding}
        margin={margin}
        isBounded={true}
        isDraggable={isEditing}
        isResizable={isEditing}
        compactType={compactType}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleDragStart}
        onResizeStop={handleDragStop}
        draggableHandle=".drag-handle"
        draggableCancel=".no-drag"
        useCSSTransforms={true}
        preventCollision={false}
      >
        {items.map((item) => (
          <div key={item.i} data-grid={item}>
            <GridItem
              title={item.title}
              onRemove={isEditing ? handleRemoveItem(item.i) : undefined}
              onEdit={onEditItem ? handleEditItem(item.i) : undefined}
              isDraggable={isEditing}
              isResizable={isEditing}
              isEditing={isEditing}
            >
              {item.content}
            </GridItem>
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {isEditing && onAddItem && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 z-10 h-10 w-10 rounded-full p-0 shadow-lg"
          onClick={onAddItem}
          aria-label="Add widget"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
