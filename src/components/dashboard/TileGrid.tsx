import React, { useState, useContext, useCallback, useMemo } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { TileType } from '../../types/dashboard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { getTileSpan } from '../../constants/dimensions';

// Grid configuration - using CSS grid spans
const GRID_COLUMNS = 8;
const GRID_ROWS = 12;

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
  const [dragTargetPosition, setDragTargetPosition] = useState<{ x: number; y: number } | null>(null);

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
        const { colSpan, rowSpan } = getTileSpan(size);
        // Mark cells as occupied
        for (let i = y; i < Math.min(y + rowSpan, GRID_ROWS); i++) {
          for (let j = x; j < Math.min(x + colSpan, GRID_COLUMNS); j++) {
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

  // Find first available position for a tile
  const findFirstAvailablePosition = useCallback((tileSize: 'small' | 'medium' | 'large' = 'medium') => {
    const { colSpan, rowSpan } = getTileSpan(tileSize);
    // Find first available position
    for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
      for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
        let canPlace = true;
        // Check if all required cells are free
        for (let i = y; i < y + rowSpan; i++) {
          for (let j = x; j < x + colSpan; j++) {
            if (grid[i][j].occupied) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) {
          return { x, y };
        }
      }
    }
    // If no position found, return a default position
    return { x: 0, y: 0 };
  }, [grid]);

  // Handle tile movement - always compact to first available position
  const handleTileMove = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile) return;

    // Always move to the first available position (compaction)
    const firstAvailable = findFirstAvailablePosition(tile.size as 'small' | 'medium' | 'large');
    moveTile(tileId, firstAvailable);
  }, [tiles, findFirstAvailablePosition, moveTile]);

  // Drag and drop hook
  const { startDrag, endDrag } = useDragAndDrop(handleTileMove);

  // Handle drag over grid
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
      setIsDragOver(true);
      // Calculate drop target position
      const rect = e.currentTarget.getBoundingClientRect();
      const gridCellWidth = rect.width / GRID_COLUMNS;
      const gridCellHeight = rect.height / GRID_ROWS;
      const x = Math.floor((e.clientX - rect.left) / gridCellWidth);
      const y = Math.floor((e.clientY - rect.top) / gridCellHeight);
      setDragTargetPosition({ x, y });
    } else if (e.dataTransfer.types.includes('application/nerdboard-tile-move')) {
      // For tile movement, we don't need to track position since we always compact
      setIsDragOver(true);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    setIsDragOver(false);
    setDragTargetPosition(null);

    const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
    if (tileType) {
      addTile(tileType as TileType);
    }

    const tileId = e.dataTransfer.getData('application/nerdboard-tile-move');
    if (tileId) {
      // Always compact to first available position
      const tile = tiles.find(t => t.id === tileId);
      if (tile) {
        const firstAvailable = findFirstAvailablePosition(tile.size as 'small' | 'medium' | 'large');
        moveTile(tileId, firstAvailable);
      }
    }
  }, [addTile, tiles, findFirstAvailablePosition, moveTile]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragTargetPosition(null);
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
      className="h-full p-4 relative overflow-y-auto"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Grid container using CSS Grid */}
      <div 
        className="relative min-h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gap: '1rem',
          minHeight: '100%',
          height: 'auto'
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
        {isDragOver && dragTargetPosition && (
          <div
            className="absolute border-2 border-dashed border-accent-primary bg-accent-muted opacity-50 pointer-events-none z-20 rounded"
            style={{
              left: `${dragTargetPosition.x * (100 / GRID_COLUMNS)}%`,
              top: `${dragTargetPosition.y * (100 / GRID_ROWS)}%`,
              width: `${100 / GRID_COLUMNS}%`,
              height: `${100 / GRID_ROWS}%`
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
