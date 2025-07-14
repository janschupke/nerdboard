import React from 'react';
import { useDragboard } from './DragboardContext';

export interface DraggableTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const DragboardTile: React.FC<DraggableTileProps> = ({ id, position, size, children }) => {
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

  return (
    <div
      className={`relative bg-surface-primary border border-theme-primary rounded-lg shadow-sm transition-shadow duration-200 ${isDragging ? 'opacity-50' : ''}`}
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
      {/* Tile header with drag handle and close button */}
      <div
        className="flex items-center justify-between px-2 py-1 cursor-move select-none"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <span className="sr-only">Drag tile</span>
        <div className="flex-1" />
        <button
          className="ml-2 p-1 rounded hover:bg-theme-tertiary focus:outline-none focus:ring"
          aria-label="Remove tile"
          onClick={() => removeTile(id)}
        >
          {/* Inline SVG close icon */}
          <svg
            className="w-4 h-4 text-theme-secondary"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" />
          </svg>
        </button>
      </div>
      {/* Tile content */}
      <div className="p-2 h-full min-h-0 flex flex-col flex-1">{children}</div>
      {/* Ghost/preview tile when dragging (optional) */}
      {isDragging && (
        <div className="absolute inset-0 bg-theme-primary opacity-30 pointer-events-none z-50 rounded-lg" />
      )}
    </div>
  );
};
