import React from 'react';
import { useDragboard } from './DragboardContext';

export interface DraggableTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const DragboardTile: React.FC<DraggableTileProps> = ({
  id,
  position,
  size,
  children,
}) => {
  const { config } = useDragboard();
  // Placeholder for drag/resize logic
  return (
    <div
      className="relative bg-surface-primary border border-theme-primary rounded-lg shadow-sm transition-shadow duration-200"
      style={{
        gridColumn: `${position.x + 1} / span ${config.tileSizes[size].colSpan}`,
        gridRow: `${position.y + 1} / span ${config.tileSizes[size].rowSpan}`,
      }}
      data-tile-id={id}
      role="gridcell"
      aria-label={`Tile ${id}`}
    >
      {/* Drag handle (to be implemented) */}
      {/* Resize handle (to be implemented) */}
      {children}
    </div>
  );
}; 
