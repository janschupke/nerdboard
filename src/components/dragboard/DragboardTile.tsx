import React from 'react';
import { useDragboard } from './DragboardContext';

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

export const DragboardTile: React.FC<DragboardTileProps> = ({ id, position, size, children }) => {
  const { config, dragState, startTileDrag, endTileDrag, removeTile } = useDragboard();
  const isDragging = dragState.draggingTileId === id;

  // Native drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/nerdboard-tile-id', id);
    startTileDrag(id, position);
  };
  const handleDragEnd = () => {
    endTileDrag(dragState.dropTarget, id);
  };

  // Pass drag handle props to the child tile
  const dragHandleProps: React.HTMLAttributes<HTMLDivElement> = {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };

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
      {/* Render the child tile with drag handle props */}
      {React.isValidElement(children) 
        ? React.cloneElement(children, {
            id,
            position,
            size,
            dragHandleProps,
            onRemove: removeTile,
          } as DraggableTileProps)
        : children}
      
      {/* Ghost/preview tile when dragging (optional) */}
      {isDragging && (
        <div className="absolute inset-0 bg-theme-primary opacity-30 pointer-events-none z-50 rounded-lg" />
      )}
    </div>
  );
};
