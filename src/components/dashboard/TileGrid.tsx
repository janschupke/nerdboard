import React, { useState, useCallback, useMemo, useContext, useRef } from 'react';
import { Tile } from './Tile';
import type { DashboardTile } from '../../types/dashboard';
import { TileType } from '../../types/dashboard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DashboardContext } from '../../contexts/DashboardContext';
import { 
  GRID_CONFIG, 
  calculateGridPosition, 
  calculateExistingTilePosition, 
  calculateDropZoneStyle, 
  isPositionValid,
  getGridTemplateStyle,
  getTileSpan
} from '../../constants/dimensions';

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
  const [draggedTileSize, setDraggedTileSize] = useState<'small' | 'medium' | 'large'>('medium');
  const gridRef = useRef<HTMLDivElement>(null);

  // Create grid representation
  const grid = useMemo(() => {
    const gridCells: GridCell[][] = Array(GRID_CONFIG.rows).fill(null).map((_, i) =>
      Array(GRID_CONFIG.columns).fill(null).map((_, j) => ({
        x: j,
        y: i,
        occupied: false,
      }))
    );

    // Place tiles in grid
    tiles.forEach((tile: DashboardTile) => {
      if (tile.position) {
        const { x, y } = tile.position;
        const size = typeof tile.size === 'string' ? tile.size : 'medium';
        const { colSpan, rowSpan } = getTileSpan(size);

        // Mark cells as occupied
        for (let i = y; i < Math.min(y + rowSpan, GRID_CONFIG.rows); i++) {
          for (let j = x; j < Math.min(x + colSpan, GRID_CONFIG.columns); j++) {
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
    for (let y = 0; y <= GRID_CONFIG.rows - rowSpan; y++) {
      for (let x = 0; x <= GRID_CONFIG.columns - colSpan; x++) {
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
    
    return { x: 0, y: 0 };
  }, [grid]);

  // Handle tile movement - existing tiles stay where dropped, new tiles compact
  const handleTileMove = useCallback((tileId: string, dropPosition?: { x: number; y: number }) => {
    const tile = tiles.find((t: DashboardTile) => t.id === tileId);
    if (!tile) return;

    // For existing tiles, use the drop position if valid
    if (dropPosition) {
      const size = typeof tile.size === 'string' ? tile.size : 'medium';
      
      // Check if the drop position is valid
      if (isPositionValid(dropPosition, size as 'small' | 'medium' | 'large')) {
        
        // Check if the target area is free
        const { colSpan, rowSpan } = getTileSpan(size);
        let canPlace = true;
        for (let i = dropPosition.y; i < dropPosition.y + rowSpan; i++) {
          for (let j = dropPosition.x; j < dropPosition.x + colSpan; j++) {
            if (grid[i] && grid[i][j] && grid[i][j].occupied && grid[i][j].tileId !== tileId) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        
        if (canPlace) {
          moveTile(tileId, dropPosition);
          return;
        }
      }
    }
    
    // If drop position is invalid or not provided, keep tile in current position
    if (tile.position) {
      // Tile already has a position, don't change it
      return;
    }
    
    // Only compact to first available position for new tiles without position
    const firstAvailable = findFirstAvailablePosition(tile.size as 'small' | 'medium' | 'large');
    moveTile(tileId, firstAvailable);
  }, [tiles, grid, findFirstAvailablePosition, moveTile]);

  // Drag and drop hook
  const { startDrag, endDrag } = useDragAndDrop(handleTileMove);

  // Handle drag over grid
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();

    if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
      setIsDragOver(true);
      setDraggedTileSize('medium'); // Default to medium for new tiles
      const position = calculateGridPosition(e.clientX, e.clientY, rect, 'medium');
      setDragTargetPosition(position);
    } else if (e.dataTransfer.types.includes('application/nerdboard-tile-move')) {
      setIsDragOver(true);
      
      // Get the tile ID from the drag event
      const tileId = e.dataTransfer.getData('application/nerdboard-tile-move');
      let tileSize: 'small' | 'medium' | 'large' = 'medium';
      if (tileId) {
        const tile = tiles.find((t: DashboardTile) => t.id === tileId);
        if (tile) {
          tileSize = (typeof tile.size === 'string' ? tile.size : 'medium') as 'small' | 'medium' | 'large';
        }
      }
      setDraggedTileSize(tileSize);
      const position = calculateExistingTilePosition(e.clientX, e.clientY, rect, tileSize);
      setDragTargetPosition(position);
    }
  }, [tiles]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    setIsDragOver(false);
    const dropPosition = dragTargetPosition;
    setDragTargetPosition(null);

    const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
    if (tileType) {
      addTile(tileType as TileType);
    }

    const tileId = e.dataTransfer.getData('application/nerdboard-tile-move');
    if (tileId && dropPosition) {
      handleTileMove(tileId, dropPosition);
    }
  }, [addTile, dragTargetPosition, handleTileMove]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragTargetPosition(null);
    setDraggedTileSize('medium');
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
            <div
              className="absolute border-2 border-dashed border-accent-primary bg-accent-muted opacity-50 pointer-events-none z-10 rounded"
              style={calculateDropZoneStyle({ x: 0, y: 0 }, draggedTileSize)}
              aria-hidden="true"
            />
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
        ref={gridRef}
        className="relative min-h-full"
        style={getGridTemplateStyle()}
      >
        {tiles.map((tile: DashboardTile) => (
          <Tile 
            key={tile.id} 
            tile={tile} 
            onRemove={removeTile}
            dragHandleProps={{
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.setData('application/nerdboard-tile-move', tile.id);
                e.dataTransfer.effectAllowed = 'move';
                const size = typeof tile.size === 'string' ? tile.size : 'medium';
                setDraggedTileSize(size as 'small' | 'medium' | 'large');
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
            style={calculateDropZoneStyle(dragTargetPosition, draggedTileSize)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
