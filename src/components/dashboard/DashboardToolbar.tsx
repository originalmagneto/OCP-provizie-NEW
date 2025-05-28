import React from 'react';
import { Button } from '../ui/Button';
import { Edit2, Save, X, Grid, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

type DashboardToolbarProps = {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAddWidget: () => void;
  className?: string;
};

export function DashboardToolbar({
  isEditing,
  onToggleEdit,
  onSave,
  onCancel,
  onAddWidget,
  className,
}: DashboardToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-b bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onAddWidget}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Widget</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Layout</span>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onToggleEdit}
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Customize</span>
          </Button>
        )}
      </div>
    </div>
  );
}
