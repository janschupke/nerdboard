import React from 'react';
import { useDragboard } from './DragboardContext';

interface DragboardGridProps {
  children: React.ReactNode;
}

// Utility to get valid drop positions for a given tile size
function getValidDropPositions(
  config: {
    columns: number;
    rows: number;
    tileSizes: Record<'small' | 'medium' | 'large', { colSpan: number; rowSpan: number }>;
  },
  tileSize: 'small' | 'medium' | 'large',
): Array<{ x: number; y: number }> {
  const { columns, rows, tileSizes } = config;
  const { colSpan, rowSpan } = tileSizes[tileSize] || tileSizes['medium'];
  const positions = [];
  for (let y = 0; y <= rows - rowSpan; y += rowSpan) {
    for (let x = 0; x <= columns - colSpan; x += colSpan) {
      positions.push({ x, y });
    }
  }
  return positions;
}

export const DragboardGrid: React.FC<DragboardGridProps> = ({ children }) => {
  const { config, dragState, endTileDrag, endSidebarDrag, setDropTarget, startSidebarDrag } =
    useDragboard();
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.rows}, minmax(8vw, 1fr))`,
    gap: '1rem',
    width: '100%',
    height: '100%',
  };

  // Determine which tile size is being dragged (tile or sidebar)
  let draggingTileSize: 'small' | 'medium' | 'large' = 'medium';
  if (dragState.isSidebarDrag && dragState.sidebarTileType) {
    // If sidebar drag, try to infer size from sidebarTileType if possible
    // For now, default to medium
    draggingTileSize = 'medium';
  } else if (dragState.draggingTileId && children) {
    // Try to infer size from the child DragboardTile with the matching id
    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        typeof child.props === 'object' &&
        child.props !== null &&
        'id' in child.props &&
        'size' in child.props &&
        (child.props.size === 'small' ||
          child.props.size === 'medium' ||
          child.props.size === 'large') &&
        child.props.id === dragState.draggingTileId
      ) {
        draggingTileSize = child.props.size;
      }
    });
  }

  // Only render drop targets at valid increments for the dragged tile size
  const dropTargets = [];
  if (dragState.draggingTileId || dragState.isSidebarDrag) {
    const validPositions = getValidDropPositions(config, draggingTileSize);
    for (const pos of validPositions) {
      const { x, y } = pos;
      dropTargets.push(
        <div
          key={`drop-${x}-${y}`}
          className={`absolute z-40 pointer-events-auto`}
          style={{
            left: `calc(${(x / config.columns) * 100}% + 1rem)`,
            top: `calc(${(y / config.rows) * 100}% + 1rem)`,
            width: `calc(100% / ${config.columns} * ${config.tileSizes[draggingTileSize].colSpan} - 2rem)`,
            height: `calc(100% / ${config.rows} * ${config.tileSizes[draggingTileSize].rowSpan} - 2rem)`,
            border:
              dragState.dropTarget && dragState.dropTarget.x === x && dragState.dropTarget.y === y
                ? '2px solid #facc15'
                : 'none',
            borderRadius: '0.5rem',
            background:
              dragState.dropTarget && dragState.dropTarget.x === x && dragState.dropTarget.y === y
                ? 'rgba(250, 204, 21, 0.1)'
                : 'transparent',
            transition: 'border 0.2s, background 0.2s',
          }}
          aria-label={`Drop target (${x + 1}, ${y + 1})`}
          aria-dropeffect="move"
          onDragOver={(e) => {
            e.preventDefault();
            // If this is a sidebar drag, and dragboard doesn't know yet, notify it
            const sidebarTileType = e.dataTransfer.getData('application/nerdboard-tile-type');
            if (sidebarTileType && !dragState.isSidebarDrag && startSidebarDrag) {
              startSidebarDrag(sidebarTileType);
            }
            setDropTarget({ x, y });
          }}
          onDragLeave={() => {
            setDropTarget(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            const sidebarTileType = e.dataTransfer.getData('application/nerdboard-tile-type');
            const tileId = e.dataTransfer.getData('application/nerdboard-tile-id');
            if (sidebarTileType && endSidebarDrag && startSidebarDrag) {
              startSidebarDrag(sidebarTileType);
              endSidebarDrag({ x, y }, sidebarTileType);
            } else if (tileId && endTileDrag) {
              endTileDrag({ x, y }, tileId);
            }
            setDropTarget(null);
          }}
        />,
      );
    }
  }

  return (
    <div
      className="relative w-full h-full p-4"
      style={gridStyle}
      role="grid"
      data-testid="dragboard-grid"
    >
      {/* Drop targets overlay */}
      {dropTargets}
      {children}
    </div>
  );
};
