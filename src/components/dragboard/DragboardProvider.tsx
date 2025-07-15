import React, { useCallback, useMemo, useState, useRef } from 'react';
import { DragboardContext, DragboardDragContext } from './DragboardContext';
import type {
  DragboardConfig,
  DragboardDragState,
  DragboardContextValue,
} from './DragboardContext';
import type { DashboardTile, TileType } from './dashboard';
import { findNextFreePosition, rearrangeTiles } from './rearrangeTiles';

interface DragboardProviderProps {
  config: DragboardConfig;
  tiles: DashboardTile[];
  addTile: (tile: DashboardTile) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
  reorderTiles: (tiles: DashboardTile[]) => void;
  children: React.ReactNode;
}

// Utility to snap a position to the nearest valid tile increment
function snapToTileGrid(
  x: number,
  y: number,
  config: DragboardConfig,
  tileSize: 'small' | 'medium' | 'large',
): { x: number; y: number } {
  const { colSpan, rowSpan } = config.tileSizes[tileSize] || config.tileSizes['medium'];
  return {
    x: Math.max(0, Math.min(config.columns - colSpan, Math.round(x / colSpan) * colSpan)),
    y: Math.max(0, Math.min(config.rows - rowSpan, Math.round(y / rowSpan) * rowSpan)),
  };
}

function getHighestOccupiedRow(tiles: DashboardTile[], tileSizes: DragboardConfig['tileSizes'], minRows: number) {
  let maxRow = minRows - 1;
  for (const tile of tiles) {
    const { rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
    const tileBottom = tile.position.y + rowSpan - 1;
    if (tileBottom > maxRow) maxRow = tileBottom;
  }
  return Math.max(maxRow + 1, minRows);
}

export const DragboardProvider: React.FC<DragboardProviderProps> = ({
  config,
  tiles,
  addTile,
  removeTile,
  updateTile,
  moveTile,
  reorderTiles,
  children,
}) => {
  // Set config defaults
  const {
    consolidation = true,
    movementEnabled = true,
    removable = true,
    dynamicExtensions = true,
    allowDragOutOfBounds = false,
    columns,
    rows: defaultRows,
    tileSizes,
    // breakpoints, // removed unused
  } = config;

  // Track current row count (for dynamic extension/reduction)
  const [rows, setRows] = useState(defaultRows);
  const defaultRowsRef = useRef(defaultRows);
  const tilesRef = useRef(tiles);
  React.useEffect(() => { tilesRef.current = tiles; }, [tiles]);

  // Drag state
  const [dragState, setDragState] = useState<DragboardDragState>({
    draggingTileId: null,
    dragOrigin: null,
    dragOffset: null,
    dropTarget: null,
    isSidebarDrag: false,
    sidebarTileType: undefined,
  });

  // Helper: Check if a tile fits in the current grid
  const tileFits = (tile: DashboardTile) => {
    const { colSpan, rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
    for (let y = 0; y <= rows - rowSpan; y++) {
      for (let x = 0; x <= columns - colSpan; x++) {
        const overlap = tiles.some((t) => {
          const tSize = tileSizes[t.size] || tileSizes['medium'];
          return (
            x < t.position.x + tSize.colSpan &&
            x + colSpan > t.position.x &&
            y < t.position.y + tSize.rowSpan &&
            y + rowSpan > t.position.y
          );
        });
        if (!overlap) return true;
      }
    }
    return false;
  };

  // Helper: Extend rows to fit a tile if needed
  const extendRowsIfNeeded = (tile: DashboardTile) => {
    const { rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
    const neededRows = tile.position.y + rowSpan;
    if (neededRows > rows) setRows(neededRows);
  };

  // Helper: Reduce rows if possible (after remove/move)
  const reduceRowsIfPossible = () => {
    const highest = getHighestOccupiedRow(tiles, tileSizes, defaultRowsRef.current);
    if (rows > highest) setRows(highest);
  };

  // Tile drag actions (drag state only)
  const startTileDrag = useCallback((tileId: string, origin: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: tileId,
      dragOrigin: origin,
      dragOffset: { x: 0, y: 0 },
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
  }, []);

  const updateTileDrag = useCallback((offset: { x: number; y: number }) => {
    setDragState((prev) => ({ ...prev, dragOffset: offset }));
  }, []);

  // End tile drag (move or out-of-bounds)
  const endTileDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileId?: string) => {
      if (!tileId) return;
      const tile = tiles.find((t) => t.id === tileId);
      if (!tile) return;
      let snappedTarget = dropTarget;
      // Out of bounds logic
      if (
        dropTarget &&
        (dropTarget.x < 0 || dropTarget.y < 0 || dropTarget.x >= columns || dropTarget.y >= rows)
      ) {
        if (allowDragOutOfBounds) {
          removeTile(tileId);
        } // else, do nothing (tile stays in place)
        setDragState((prev) => ({
          ...prev,
          draggingTileId: null,
          dragOrigin: null,
          dragOffset: null,
          dropTarget: null,
          isSidebarDrag: false,
          sidebarTileType: undefined,
        }));
        return;
      }
      if (dropTarget) {
        const tileSize: 'small' | 'medium' | 'large' = tile.size;
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, { ...config, rows }, tileSize);
        moveTile(tileId, snappedTarget);
        // Consolidation logic
        if (consolidation) {
          // Only pass tiles with non-null position
          const safeTiles = tiles.map(t => t.id === tileId ? { ...t, position: snappedTarget! } : t).filter(t => t.position != null) as DashboardTile[];
          reorderTiles(rearrangeTiles(safeTiles));
        }
        // Dynamic row extension (after move)
        extendRowsIfNeeded({ ...tile, position: snappedTarget });
        // Dynamic row reduction (after move)
        reduceRowsIfPossible();
      }
      setDragState((prev) => ({
        ...prev,
        draggingTileId: null,
        dragOrigin: null,
        dragOffset: null,
        dropTarget: snappedTarget,
        isSidebarDrag: false,
        sidebarTileType: undefined,
      }));
    },
    [columns, rows, allowDragOutOfBounds, moveTile, removeTile, config, consolidation, reorderTiles, tiles, extendRowsIfNeeded, reduceRowsIfPossible],
  );

  // Sidebar drag actions
  const startSidebarDrag = useCallback((tileType: string) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: null,
      dragOrigin: null,
      dragOffset: null,
      dropTarget: null,
      isSidebarDrag: true,
      sidebarTileType: tileType,
    }));
  }, []);

  const endSidebarDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileType?: string) => {
      if (!tileType) return;
      let snappedTarget = dropTarget;
      // Only allow drop if within bounds
      if (
        dropTarget &&
        (dropTarget.x < 0 || dropTarget.y < 0 || dropTarget.x >= columns || dropTarget.y >= rows)
      ) {
        // Out of bounds drop: do nothing
        setDragState((prev) => ({
          ...prev,
          draggingTileId: null,
          dragOrigin: null,
          dragOffset: null,
          dropTarget: null,
          isSidebarDrag: false,
          sidebarTileType: undefined,
        }));
        return;
      }
      // Find next free position if not provided
      if (!dropTarget) {
        snappedTarget = findNextFreePosition(tiles, { ...config, rows }, 'medium') || { x: 0, y: 0 };
      }
      // Prepare new tile
      const newTile: DashboardTile = {
        id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: tileType as TileType,
        position: snappedTarget!,
        size: 'medium',
        createdAt: Date.now(),
      };
      // Check if tile fits
      if (!tileFits(newTile)) {
        if (!dynamicExtensions) {
          throw new Error('Board is full and dynamicExtensions is disabled.');
        } else {
          // Extend rows to fit
          extendRowsIfNeeded(newTile);
        }
      }
      addTile(newTile);
      // Consolidation logic
      if (consolidation) {
        // Only pass tiles with non-null position
        const safeTiles = [...tiles, newTile].filter(t => t.position != null) as DashboardTile[];
        reorderTiles(rearrangeTiles(safeTiles));
      }
      // Dynamic row extension (after add)
      extendRowsIfNeeded(newTile);
      // Dynamic row reduction (after add)
      reduceRowsIfPossible();
      setDragState((prev) => ({
        ...prev,
        draggingTileId: null,
        dragOrigin: null,
        dragOffset: null,
        dropTarget: snappedTarget,
        isSidebarDrag: false,
        sidebarTileType: undefined,
      }));
    },
    [columns, rows, config, tiles, addTile, dynamicExtensions, consolidation, reorderTiles, tileFits, extendRowsIfNeeded, reduceRowsIfPossible],
  );

  // Set drop target for drag-over events
  const setDropTarget = useCallback((target: { x: number; y: number } | null) => {
    setDragState((prev) => ({ ...prev, dropTarget: target }));
  }, []);

  // After remove, reduce rows if possible
  const wrappedRemoveTile = useCallback((id: string) => {
    removeTile(id);
    reduceRowsIfPossible();
  }, [removeTile, reduceRowsIfPossible]);

  // After move, reduce rows if possible
  const wrappedMoveTile = useCallback((tileId: string, newPosition: { x: number; y: number }) => {
    moveTile(tileId, newPosition);
    reduceRowsIfPossible();
  }, [moveTile, reduceRowsIfPossible]);

  // Memoize drag context value separately for performance
  const dragContextValue = useMemo(() => ({
    dragState,
    startTileDrag,
    updateTileDrag,
    endTileDrag,
    startSidebarDrag,
    endSidebarDrag,
    setDropTarget,
  }), [dragState, startTileDrag, updateTileDrag, endTileDrag, startSidebarDrag, endSidebarDrag, setDropTarget]);

  // Memoize main context value (public API)
  const value = useMemo<
    DragboardContextValue & {
      tiles: DashboardTile[];
      addTile: (tile: DashboardTile) => void;
      removeTile: (id: string) => void;
      updateTile: (id: string, updates: Partial<DashboardTile>) => void;
      moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
      reorderTiles: (tiles: DashboardTile[]) => void;
      movementEnabled: boolean;
      removable: boolean;
      rows: number;
    }
  >(
    () => ({
      config: { ...config, rows },
      dragState,
      // Deprecated: use useDragboardDrag for drag actions
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
      tiles,
      addTile: (tile: DashboardTile) => {
        // Use latest tiles for error check
        const currentTiles = tilesRef.current;
        const { colSpan, rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
        let fits = false;
        for (let y = 0; y <= rows - rowSpan; y++) {
          for (let x = 0; x <= columns - colSpan; x++) {
            const overlap = currentTiles.some((t) => {
              const tSize = tileSizes[t.size] || tileSizes['medium'];
              return (
                x < t.position.x + tSize.colSpan &&
                x + colSpan > t.position.x &&
                y < t.position.y + tSize.rowSpan &&
                y + rowSpan > t.position.y
              );
            });
            if (!overlap) { fits = true; break; }
          }
          if (fits) break;
        }
        if (!fits) {
          if (!dynamicExtensions) {
            throw new Error('Board is full and dynamicExtensions is disabled.');
          } else {
            extendRowsIfNeeded(tile);
          }
        }
        addTile(tile);
        // Consolidation logic
        if (consolidation) {
          // Only pass tiles with non-null position
          const safeTiles = [...currentTiles, tile].filter(t => t.position != null) as DashboardTile[];
          reorderTiles(rearrangeTiles(safeTiles));
        }
        // Dynamic row extension (after add)
        extendRowsIfNeeded(tile);
        // Dynamic row reduction (after add)
        reduceRowsIfPossible();
      },
      removeTile: wrappedRemoveTile,
      updateTile,
      moveTile: wrappedMoveTile,
      reorderTiles,
      movementEnabled,
      removable,
      rows,
    }),
    [config, rows, dragState, startTileDrag, updateTileDrag, endTileDrag, startSidebarDrag, endSidebarDrag, setDropTarget, tiles, addTile, wrappedRemoveTile, updateTile, wrappedMoveTile, reorderTiles, movementEnabled, removable],
  );

  return (
    <DragboardContext.Provider value={value}>
      <DragboardDragContext.Provider value={dragContextValue}>
        {children}
      </DragboardDragContext.Provider>
    </DragboardContext.Provider>
  );
};
