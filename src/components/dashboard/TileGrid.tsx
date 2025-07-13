import React, { useState, useContext, useCallback, useMemo } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { TileType } from '../../types/dashboard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

// Grid configuration
const GRID_COLUMNS = 6;
const GRID_ROWS = 4;
const GRID_CELL_SIZE = 200; // pixels

interface GridPosition {
  x: number;
  y: number;
}

interface GridCell {
  x: number;
  y: number;
  occupied: boolean;
  tileId?: string;
}

export function TileGrid() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('TileGrid must be used within DashboardProvider');
  }

  const { state, removeTile, addTile, moveTile } = dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<GridPosition | null>(null);

  // Create grid representation
  const grid = useMemo(() => {
    const gridCells: GridCell[][] = Array(GRID_ROWS).fill(null).map(() =>
      Array(GRID_COLUMNS).fill(null).map(() => ({ x: 0, y: 0, occupied: false }))
    );

    // Place tiles in grid
    tiles.forEach((tile) => {
      if (tile.position) {
        const { x, y } = tile.position;
        const size = typeof tile.size === 'string' ? tile.size : 'medium';
        const spanX = size === 'large' ? 3 : 2;
        const spanY = size === 'large' ? 3 : 2;

        // Mark cells as occupied
        for (let i = y; i < Math.min(y + spanY, GRID_ROWS); i++) {
          for (let j = x; j < Math.min(x + spanX, GRID_COLUMNS); j++) {
            if (gridCells[i] && gridCells[i][j]) {
              gridCells[i][j].occupied = true;
              gridCells[i][j].tileId = tile.id;
            }
          }
        }
      }
    });

    return gridCells;
  }, [tiles]);

  // Handle tile movement
  const handleTileMove = useCallback((tileId: string, newPosition: GridPosition) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile) return;

    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const spanX = size === 'large' ? 3 : 2;
    const spanY = size === 'large' ? 3 : 2;

    // Check if new position is valid
    let canMove = true;
    for (let i = newPosition.y; i < newPosition.y + spanY; i++) {
      for (let j = newPosition.x; j < newPosition.x + spanX; j++) {
        if (i >= GRID_ROWS || j >= GRID_COLUMNS) {
          canMove = false;
          break;
        }
        if (grid[i][j].occupied && grid[i][j].tileId !== tileId) {
          canMove = false;
          break;
        }
      }
      if (!canMove) break;
    }

    if (canMove) {
      // Auto-compaction: find the first available slot (top-left to bottom-right)
      outer: for (let y = 0; y <= GRID_ROWS - spanY; y++) {
        for (let x = 0; x <= GRID_COLUMNS - spanX; x++) {
          let slotFree = true;
          for (let i = y; i < y + spanY; i++) {
            for (let j = x; j < x + spanX; j++) {
              // Allow the current tile to overlap itself
              if (grid[i][j].occupied && grid[i][j].tileId !== tileId) {
                slotFree = false;
                break;
              }
            }
            if (!slotFree) break;
          }
          if (slotFree) {
            // If the first available slot is before the intended position, use it
            if (y < newPosition.y || (y === newPosition.y && x < newPosition.x)) {
              moveTile(tileId, { x, y });
              break outer;
            }
          }
        }
      }
      // Otherwise, move to the intended position
      moveTile(tileId, newPosition);
    }
  }, [tiles, grid, moveTile]);

  // Drag and drop hook
  const { startDrag, endDrag } = useDragAndDrop(handleTileMove);

  // Handle drag over grid
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
      setIsDragOver(true);
    } else if (e.dataTransfer.types.includes('application/nerdboard-tile-move')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / GRID_CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / GRID_CELL_SIZE);
      setDragOverPosition({ x, y });
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    setIsDragOver(false);
    setDragOverPosition(null);

    const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
    if (tileType) {
      addTile(tileType as TileType);
    }

    const tileId = e.dataTransfer.getData('application/nerdboard-tile-move');
    if (tileId && dragOverPosition) {
      handleTileMove(tileId, dragOverPosition);
    }
  }, [addTile, dragOverPosition, handleTileMove]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragOverPosition(null);
  }, []);

  if (tiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center relative">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-theme-tertiary rounded-lg flex items-center justify-center">
              <span className="text-2xl text-theme-secondary">📊</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-theme-primary mb-2">No tiles yet</h3>
          <p className="text-theme-secondary mb-4">
            Add tiles from the sidebar to start building your dashboard
          </p>
          <div className="text-sm text-theme-tertiary">
            <p>Drag tiles from the sidebar or click to add them</p>
          </div>
        </div>

        {/* Full-size drag target overlay */}
        <div
          className="absolute inset-0 z-10"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-accent-muted opacity-30 pointer-events-none z-10 rounded-lg ring-4 ring-accent-primary" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full p-4 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Grid background for visual reference */}
      <div 
        className="absolute inset-4 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-theme-tertiary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-theme-tertiary) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_CELL_SIZE}px ${GRID_CELL_SIZE}px`,
          opacity: 0.3
        }}
      />

      {/* Grid container */}
      <div 
        className="relative h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${GRID_CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${GRID_CELL_SIZE}px)`,
          gap: '8px'
        }}
      >
        {tiles.map((tile) => (
          <Tile 
            key={tile.id} 
            tile={tile} 
            onRemove={removeTile}
            dragHandleProps={{
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.setData('application/nerdboard-tile-move', tile.id);
                e.dataTransfer.effectAllowed = 'move';
                startDrag(tile.id, tile.position || { x: 0, y: 0 });
              },
              onDragEnd: endDrag,
              className: 'cursor-grab active:cursor-grabbing'
            }}
          />
        ))}

        {/* Drop zone indicator */}
        {dragOverPosition && (
          <div
            className="absolute border-2 border-dashed border-accent-primary bg-accent-muted opacity-50 pointer-events-none z-20"
            style={{
              left: `${dragOverPosition.x * GRID_CELL_SIZE}px`,
              top: `${dragOverPosition.y * GRID_CELL_SIZE}px`,
              width: `${GRID_CELL_SIZE}px`,
              height: `${GRID_CELL_SIZE}px`
            }}
          />
        )}
      </div>
    </div>
  );
}
