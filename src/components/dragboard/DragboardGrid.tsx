import React, { useMemo, useCallback, memo } from 'react';
import { useDragboard, useDragboardDrag } from './DragboardContext';

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

export const DragboardGrid = memo<DragboardGridProps>(({ children }) => {
  const { config, rows } = useDragboard();
  const { dragState, endTileDrag, endSidebarDrag, setDropTarget, startSidebarDrag } =
    useDragboardDrag();

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(8vw, 1fr))`,
      gap: '1rem',
      width: '100%',
      height: '100%',
      position: 'relative',
    }),
    [config.columns, rows],
  );

  // Memoize the dragging tile size detection
  const draggingTileSize = useMemo<'small' | 'medium' | 'large'>(() => {
    if (dragState.isSidebarDrag && dragState.sidebarTileType) {
      return 'medium';
    } else if (dragState.draggingTileId) {
      return 'medium';
    }
    return 'medium';
  }, [dragState.draggingTileId, dragState.isSidebarDrag, dragState.sidebarTileType]);

  // Memoize drop target handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent, x: number, y: number) => {
      e.preventDefault();
      const sidebarTileType = e.dataTransfer.getData('application/dashboard-tile-type');
      if (sidebarTileType && !dragState.isSidebarDrag && startSidebarDrag) {
        startSidebarDrag(sidebarTileType);
      }
      setDropTarget({ x, y });
    },
    [dragState.isSidebarDrag, startSidebarDrag, setDropTarget],
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, [setDropTarget]);

  const handleDrop = useCallback(
    (e: React.DragEvent, x: number, y: number) => {
      e.preventDefault();
      const sidebarTileType = e.dataTransfer.getData('application/dashboard-tile-type');
      const tileId = e.dataTransfer.getData('application/dashboard-tile-id');
      if (sidebarTileType && endSidebarDrag && startSidebarDrag) {
        startSidebarDrag(sidebarTileType);
        endSidebarDrag({ x, y }, sidebarTileType);
      } else if (tileId && endTileDrag) {
        endTileDrag({ x, y }, tileId);
      }
      setDropTarget(null);
    },
    [endSidebarDrag, startSidebarDrag, endTileDrag, setDropTarget],
  );

  // Memoize drop targets overlay
  const dropTargetsOverlay = useMemo(() => {
    if (!config.movementEnabled) return null;
    if (!dragState.draggingTileId && !dragState.isSidebarDrag) {
      return null;
    }
    const validPositions = getValidDropPositions(config, draggingTileSize);
    return (
      <div className="absolute inset-0 pointer-events-none z-40" style={{ pointerEvents: 'none' }}>
        {validPositions.map(({ x, y }) => (
          <div
            key={`drop-${x}-${y}`}
            className="pointer-events-auto"
            style={{
              position: 'absolute',
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
              zIndex: 40,
            }}
            aria-label={`Drop target (${x + 1}, ${y + 1})`}
            aria-dropeffect="move"
            onDragOver={(e) => handleDragOver(e, x, y)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, x, y)}
          />
        ))}
      </div>
    );
  }, [
    config,
    draggingTileSize,
    dragState.draggingTileId,
    dragState.isSidebarDrag,
    dragState.dropTarget,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  ]);

  return (
    <div
      className="relative w-full h-full p-4"
      style={gridStyle}
      role="grid"
      data-testid="dragboard-grid"
    >
      {/* Tiles (stable, never affected by drop targets) */}
      {children}
      {/* Drop targets overlay (absolutely positioned, never affects tiles) */}
      {dropTargetsOverlay}
    </div>
  );
});

DragboardGrid.displayName = 'DragboardGrid';
