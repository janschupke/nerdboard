import React, { useState, useCallback, useContext, useRef, useEffect } from 'react';
import { Tile } from './Tile';
import type { DashboardTile } from '../../types/dashboard';
import { TileType } from '../../types/dashboard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DashboardContext } from '../../contexts/DashboardContext';
import {
  GRID_CONFIG,
  calculateGridPosition,
  calculateDropZoneStyle,
  getGridTemplateStyle,
  getTileSpan,
} from '../../constants/gridSystem';

export function TileGrid() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('TileGrid must be used within DashboardProvider');
  }

  const { state, removeTile, addTile, moveTile, updateTile, reorderTiles } = dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragTargetPosition, setDragTargetPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draggedTileSize, setDraggedTileSize] = useState<'small' | 'medium' | 'large'>('medium');
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowCount, setRowCount] = useState<number>(3); // Start with a reasonable default

  // Helper to compute minimum rows needed for all tiles
  const computeMinRowsNeeded = useCallback(() => {
    if (tiles.length === 0) return 1;
    let maxRow = 1;
    for (const tile of tiles) {
      const size = typeof tile.size === 'string' ? tile.size : 'medium';
      const { rowSpan } = getTileSpan(size);
      const y = tile.position?.y ?? 0;
      maxRow = Math.max(maxRow, y + rowSpan);
    }
    return maxRow;
  }, [tiles]);

  // Update rowCount when tiles or window size changes
  useEffect(() => {
    function updateRows() {
      const minRows = computeMinRowsNeeded();
      let rowsInViewport = Number(GRID_CONFIG.rows);

      if (gridRef.current) {
        const gridHeight = gridRef.current.offsetHeight || gridRef.current.clientHeight;

        // Calculate actual row height from rendered tiles
        let actualRowHeight = 200; // Default fallback
        const tileElements = gridRef.current.querySelectorAll('[data-tile-id]');

        if (tileElements.length > 0) {
          // Find the tallest tile to determine row height
          let maxTileHeight = 0;
          tileElements.forEach((tileElement) => {
            const rect = tileElement.getBoundingClientRect();
            maxTileHeight = Math.max(maxTileHeight, rect.height);
          });

          // Add some padding for gaps
          actualRowHeight = maxTileHeight + 16; // 16px for gap
        }

        rowsInViewport = Math.max(1, Math.floor(gridHeight / actualRowHeight));
      }

      setRowCount(Math.max(minRows, rowsInViewport));
    }
    updateRows();
    window.addEventListener('resize', updateRows);
    return () => window.removeEventListener('resize', updateRows);
  }, [tiles, computeMinRowsNeeded]);

  // Compact tiles to fill empty spaces from left to right, top to bottom
  const compactTiles = useCallback(
    (orderedTiles?: DashboardTile[]) => {
      // Use provided order or default to creation order
      const tilesInOrder = orderedTiles
        ? [...orderedTiles]
        : [...tiles].sort((a, b) => {
            const aCreated = a.createdAt || 0;
            const bCreated = b.createdAt || 0;
            return aCreated - bCreated;
          });

      const newPositions = new Map<string, { x: number; y: number }>();
      const occupiedCells = new Set<string>();

      tilesInOrder.forEach((tile) => {
        const size = typeof tile.size === 'string' ? tile.size : 'medium';
        const { colSpan, rowSpan } = getTileSpan(size);

        // Find first available position for this tile
        let found = false;
        for (let y = 0; y <= GRID_CONFIG.rows - rowSpan && !found; y++) {
          for (let x = 0; x <= GRID_CONFIG.columns - colSpan && !found; x++) {
            let canPlace = true;

            // Check if all required cells are free
            for (let i = y; i < y + rowSpan; i++) {
              for (let j = x; j < x + colSpan; j++) {
                const cellKey = `${i},${j}`;
                if (occupiedCells.has(cellKey)) {
                  canPlace = false;
                  break;
                }
              }
              if (!canPlace) break;
            }

            if (canPlace) {
              newPositions.set(tile.id, { x, y });
              // Mark cells as occupied
              for (let i = y; i < y + rowSpan; i++) {
                for (let j = x; j < x + colSpan; j++) {
                  occupiedCells.add(`${i},${j}`);
                }
              }
              found = true;
            }
          }
        }
      });

      // Apply new positions in a single batch
      newPositions.forEach((position, tileId) => {
        updateTile(tileId, { position });
      });
    },
    [tiles, updateTile],
  );

  // Handle tile movement - always compact after any move
  const handleTileMove = useCallback(
    (tileId: string, dropPosition?: { x: number; y: number }) => {
      const tile = tiles.find((t: DashboardTile) => t.id === tileId);
      if (!tile) return;
      // Prevent no-op move: if dropPosition is the same as current position, do nothing
      if (
        dropPosition &&
        tile.position &&
        dropPosition.x === tile.position.x &&
        dropPosition.y === tile.position.y
      ) {
        return;
      }
      let newOrder = [...tiles];
      if (dropPosition) {
        const size = typeof tile.size === 'string' ? tile.size : 'medium';
        const { colSpan, rowSpan } = getTileSpan(size);
        // Check if drop position is valid and not occupied
        let canPlace = true;
        for (let i = dropPosition.y; i < dropPosition.y + rowSpan; i++) {
          for (let j = dropPosition.x; j < dropPosition.x + colSpan; j++) {
            if (i >= GRID_CONFIG.rows || j >= GRID_CONFIG.columns) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) {
          // Place the dragged tile at the drop position
          moveTile(tileId, dropPosition);
          // Find if dropPosition is on top of an existing tile
          let insertIndex = -1;
          for (let idx = 0; idx < tiles.length; idx++) {
            const t = tiles[idx];
            if (t.id === tileId) continue;
            const tSize = typeof t.size === 'string' ? t.size : 'medium';
            const { colSpan: tCol, rowSpan: tRow } = getTileSpan(tSize);
            const tX = t.position?.x ?? 0;
            const tY = t.position?.y ?? 0;
            if (
              dropPosition.x >= tX &&
              dropPosition.x < tX + tCol &&
              dropPosition.y >= tY &&
              dropPosition.y < tY + tRow
            ) {
              insertIndex = idx;
              break;
            }
          }
          // Remove dragged tile from current order
          newOrder = tiles.filter((t) => t.id !== tileId);
          if (insertIndex === -1) {
            // Not on top of any tile: move to end
            newOrder.push(tile);
          } else {
            // Insert at found index
            newOrder.splice(insertIndex, 0, tile);
          }
          reorderTiles(newOrder);
          compactTiles(newOrder);
          return;
        }
      }
      // Always compact all tiles after any move, regardless of drop position validity
      compactTiles();
    },
    [tiles, moveTile, compactTiles, reorderTiles],
  );

  // Drag and drop hook
  const { startDrag, endDrag } = useDragAndDrop(handleTileMove);

  // Helper to get the closest grid position based on cursor Y
  const getClosestGridPosition = useCallback(
    (clientX: number, clientY: number, tileSize: 'small' | 'medium' | 'large') => {
      if (!gridRef.current) return { x: 0, y: 0 };
      const rect = gridRef.current.getBoundingClientRect();
      const tileElements = Array.from(
        gridRef.current.querySelectorAll('[data-tile-id]'),
      ) as HTMLElement[];
      if (tileElements.length === 0) {
        // Fallback to old logic if no tiles
        return calculateGridPosition(clientX, clientY, rect, tileSize);
      }
      // Find the closest tile boundary (top or bottom) to the cursor Y
      let minDist = Infinity;
      let closestRow = 0;
      tileElements.forEach((el) => {
        const tileRect = el.getBoundingClientRect();
        // Check top and bottom boundaries
        [tileRect.top, tileRect.bottom].forEach((boundary, idx) => {
          const dist = Math.abs(clientY - boundary);
          if (dist < minDist) {
            minDist = dist;
            // Calculate the corresponding grid row
            // Use the tile's data-tile-id to find its position
            const tileId = el.getAttribute('data-tile-id');
            const tile = tiles.find((t) => t.id === tileId);
            if (tile && tile.position) {
              const { rowSpan } = getTileSpan(tile.size);
              closestRow = tile.position.y + (idx === 0 ? 0 : rowSpan); // top or bottom
            }
          }
        });
      });
      // For X, use the old logic (snap to colSpan)
      const gridCellWidth = rect.width / GRID_CONFIG.columns;
      const rawX = (clientX - rect.left) / gridCellWidth;
      const { colSpan } = getTileSpan(tileSize);
      const x = Math.floor(rawX / colSpan) * colSpan;
      return { x, y: closestRow };
    },
    [tiles],
  );

  // Handle drag over grid
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!gridRef.current) return;
      if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
        setIsDragOver(true);
        setDraggedTileSize('medium'); // Default to medium for new tiles
        const position = getClosestGridPosition(e.clientX, e.clientY, 'medium');
        setDragTargetPosition(position);
      } else if (e.dataTransfer.types.includes('application/nerdboard-tile-move')) {
        setIsDragOver(true);
        // Get the tile ID from the drag event
        const tileId = e.dataTransfer.getData('application/nerdboard-tile-move');
        let tileSize: 'small' | 'medium' | 'large' = 'medium';
        if (tileId) {
          const tile = tiles.find((t: DashboardTile) => t.id === tileId);
          if (tile) {
            tileSize = (typeof tile.size === 'string' ? tile.size : 'medium') as
              | 'small'
              | 'medium'
              | 'large';
          }
        }
        setDraggedTileSize(tileSize);
        const position = getClosestGridPosition(e.clientX, e.clientY, tileSize);
        setDragTargetPosition(position);
      }
    },
    [tiles, getClosestGridPosition],
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
    },
    [addTile, dragTargetPosition, handleTileMove],
  );

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
              style={calculateDropZoneStyle({ x: 0, y: 0 }, draggedTileSize, rowCount)}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="relative grid w-full h-full p-4"
      style={getGridTemplateStyle()}
      data-testid="tile-grid"
      onDragOver={handleDragOver}
      onDrop={endDrag}
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
              const size = typeof tile.size === 'string' ? tile.size : 'medium';
              setDraggedTileSize(size as 'small' | 'medium' | 'large');
              startDrag(tile.id, tile.position || { x: 0, y: 0 });
            },
            onDragEnd: endDrag,
            className: 'cursor-grab active:cursor-grabbing',
          }}
        />
      ))}
      {/* Fade-out effect at the bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-surface-primary to-transparent z-20" />
    </div>
  );
}
