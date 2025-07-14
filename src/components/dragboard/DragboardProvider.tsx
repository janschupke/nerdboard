import React, { useCallback, useMemo, useState } from 'react';
import { DragboardContext } from './DragboardContext';
import type {
  DragboardConfig,
  DragboardDragState,
  DragboardContextValue,
} from './DragboardContext';
import type { DashboardTile } from './dashboard.ts';
import { findNextFreePosition } from './rearrangeTiles';

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
  // Drag state
  const [dragState, setDragState] = useState<DragboardDragState>({
    draggingTileId: null,
    dragOrigin: null,
    dragOffset: null,
    dropTarget: null,
    isSidebarDrag: false,
    sidebarTileType: undefined,
  });

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

  const endTileDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileId?: string) => {
      let snappedTarget = dropTarget;
      if (dropTarget && tileId) {
        const tileSize: 'small' | 'medium' | 'large' = 'medium';
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, config, tileSize);
        // Move the tile in app state
        moveTile(tileId, snappedTarget);
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
    [config, moveTile],
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
      let snappedTarget = dropTarget;
      if (!dropTarget && tileType) {
        // If no dropTarget, find next free position
        snappedTarget = findNextFreePosition(tiles, config, 'medium') || { x: 0, y: 0 };
      } else if (dropTarget && tileType) {
        const tileSize: 'small' | 'medium' | 'large' = 'medium';
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, config, tileSize);
      }
      if (snappedTarget && tileType) {
        addTile({
          id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: tileType as import('./dashboard').TileType,
          position: snappedTarget,
          size: 'medium',
          createdAt: Date.now(),
        });
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
    [config, addTile, tiles],
  );

  // Set drop target for drag-over events
  const setDropTarget = useCallback((target: { x: number; y: number } | null) => {
    setDragState((prev) => ({ ...prev, dropTarget: target }));
  }, []);

  const value = useMemo<DragboardContextValue & {
    tiles: DashboardTile[];
    addTile: (tile: DashboardTile) => void;
    removeTile: (id: string) => void;
    updateTile: (id: string, updates: Partial<DashboardTile>) => void;
    moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
    reorderTiles: (tiles: DashboardTile[]) => void;
  }>(
    () => ({
      config,
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
      tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
    }),
    [config, dragState, startTileDrag, updateTileDrag, endTileDrag, startSidebarDrag, endSidebarDrag, setDropTarget, tiles, addTile, removeTile, updateTile, moveTile, reorderTiles],
  );

  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
};
