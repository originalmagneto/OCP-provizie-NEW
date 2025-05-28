import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { GripVertical, X } from 'lucide-react';

type GridItemProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  onRemove?: () => void;
  onEdit?: () => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  isEditing?: boolean;
  actions?: ReactNode;
};

export function GridItem({
  children,
  title,
  className,
  onRemove,
  onEdit,
  isDraggable = true,
  isResizable = true,
  isEditing = false,
  actions,
}: GridItemProps) {
  return (
    <div className={cn('h-full w-full', className)}>
      <div className="grid-item-content group">
        {(title || onRemove || actions) && (
          <div className="grid-item-header">
            <div className="flex items-center gap-2 overflow-hidden">
              {isDraggable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-move p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              )}
              <h3 className="grid-item-title">{title}</h3>
            </div>
            <div className="grid-item-actions flex items-center gap-1">
              {actions}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={onEdit}
                  aria-label="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={onRemove}
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="grid-item-body">{children}</div>
      </div>
    </div>
  );
}
