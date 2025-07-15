import React, { useCallback, useMemo } from 'react';
import { useDragboard, useDragboardDrag } from './DragboardContext';

export interface DraggableTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-tile-id'?: string;
  'data-tile-type'?: string;
  role?: string;
  'aria-label'?: string;
}

export type DraggableTileComponent = React.ComponentType<DraggableTileProps>;

export interface DragboardTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const DragboardTileComponent: React.FC<DragboardTileProps> = ({ id, position, size, children }) => {
  const { config, removeTile, movementEnabled = true, removable = true } = useDragboard();
  const { dragState, startTileDrag, endTileDrag } = useDragboardDrag();
  const isDragging = dragState.draggingTileId === id;

  // Native drag-and-drop handlers - memoized to prevent recreation
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!movementEnabled) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/nerdboard-tile-id', id);
      startTileDrag(id, position);
    },
    [id, position, startTileDrag, movementEnabled],
  );

  const handleDragEnd = useCallback(() => {
    if (!movementEnabled) return;
    endTileDrag(dragState.dropTarget, id);
  }, [dragState.dropTarget, endTileDrag, id, movementEnabled]);

  // Pass drag handle props to the child tile - memoized to prevent recreation
  const dragHandleProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () =>
      movementEnabled
        ? {
            draggable: true,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
          }
        : {},
    [handleDragStart, handleDragEnd, movementEnabled],
  );

  // Memoize the remove function to prevent recreation
  const handleRemove = useCallback(
    (tileId: string) => {
      if (!removable) return;
      removeTile(tileId);
    },
    [removeTile, removable],
  );

  return (
    <div
      className={`relative transition-shadow duration-200 ${isDragging ? 'opacity-50' : ''}`}
      style={{
        gridColumn: `${position.x + 1} / span ${config.tileSizes[size].colSpan}`,
        gridRow: `${position.y + 1} / span ${config.tileSizes[size].rowSpan}`,
        zIndex: isDragging ? 50 : undefined,
        height: '100%',
      }}
      data-tile-id={id}
      role="gridcell"
      aria-label={`Tile ${id}`}
    >
      {/* Render the child tile with drag handle props if movement is enabled */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            dragHandleProps,
            onRemove: handleRemove,
          } as Partial<DraggableTileProps>)
        : children}

      {/* Ghost/preview tile when dragging (optional) */}
      {isDragging && (
        <div className="absolute inset-0 bg-theme-primary opacity-30 pointer-events-none z-50 rounded-lg" />
      )}

      {/* Remove button, only if removable is true */}
      {removable && handleRemove && (
        <button
          onClick={() => handleRemove(id)}
          className="absolute top-1 right-1 p-1 text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-text-tertiary rounded transition-colors cursor-pointer z-10"
          aria-label={`Remove tile`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
};

export const DragboardTile = React.memo(DragboardTileComponent);
