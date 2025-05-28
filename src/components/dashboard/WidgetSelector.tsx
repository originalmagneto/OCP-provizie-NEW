import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type WidgetType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: { w: number; h: number };
  component: React.ComponentType<any>;
  category: string;
};

type WidgetSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (widget: Omit<WidgetType, 'component'>) => void;
  availableWidgets: WidgetType[];
  className?: string;
};

export function WidgetSelector({
  open,
  onOpenChange,
  onSelect,
  availableWidgets,
  className,
}: WidgetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = React.useMemo(() => {
    const cats = new Set(availableWidgets.map((w) => w.category));
    return ['all', ...Array.from(cats)];
  }, [availableWidgets]);

  const filteredWidgets = React.useMemo(() => {
    return availableWidgets.filter((widget) => {
      const matchesSearch =
        searchQuery === '' ||
        widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || widget.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [availableWidgets, searchQuery, selectedCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-3xl', className)}>
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredWidgets.length > 0 ? (
              filteredWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  onClick={() => {
                    onSelect(widget);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {widget.icon}
                    </div>
                    <h3 className="font-medium">{widget.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {widget.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                      {widget.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {widget.defaultSize.w}×{widget.defaultSize.h}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No widgets found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
