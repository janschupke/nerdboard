import React from 'react';
import { DragboardContext } from './DragboardContext';
import type {
  DragboardConfig,
  DragboardDragState,
  DragboardContextValue,
} from './DragboardContext';

interface DragboardProviderProps {
  config: DragboardConfig;
  children: React.ReactNode;
  endTileDrag?: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  endSidebarDrag?: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  removeTile?: (tileId: string) => void;
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
  children,
  endTileDrag,
  endSidebarDrag,
  removeTile,
}) => {
  const [dragState, setDragState] = React.useState<DragboardDragState>({
    draggingTileId: null,
    dragOrigin: null,
    dragOffset: null,
    dropTarget: null,
    isSidebarDrag: false,
    sidebarTileType: undefined,
  });

  // Tile drag actions
  const startTileDrag = React.useCallback((tileId: string, origin: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: tileId,
      dragOrigin: origin,
      dragOffset: { x: 0, y: 0 },
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
  }, []);

  const updateTileDrag = React.useCallback((offset: { x: number; y: number }) => {
    setDragState((prev) => ({ ...prev, dragOffset: offset }));
  }, []);

  const _endTileDrag = React.useCallback(
    (dropTarget: { x: number; y: number } | null, tileId?: string) => {
      let snappedTarget = dropTarget;
      if (dropTarget && tileId) {
        // Find the tile size from config or default to medium
        const tileSize: 'small' | 'medium' | 'large' = 'medium';
        // Optionally, you could pass the size as a prop or context if needed
        // For now, default to medium
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, config, tileSize);
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
      if (endTileDrag) {
        endTileDrag(snappedTarget, tileId);
      }
    },
    [endTileDrag, config],
  );

  // Sidebar drag actions
  const startSidebarDrag = React.useCallback((tileType: string) => {
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

  const _endSidebarDrag = React.useCallback(
    (dropTarget: { x: number; y: number } | null, tileType?: string) => {
      let snappedTarget = dropTarget;
      if (dropTarget && tileType) {
        // Optionally, map tileType to a size if needed; for now, default to medium
        const tileSize: 'small' | 'medium' | 'large' = 'medium';
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, config, tileSize);
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
      if (endSidebarDrag) {
        endSidebarDrag(snappedTarget, tileType);
      }
    },
    [endSidebarDrag, config],
  );

  // Remove tile action (to be connected to dashboard state)
  const _removeTile = React.useCallback(
    (tileId: string) => {
      if (removeTile) {
        removeTile(tileId);
      }
    },
    [removeTile],
  );

  // Set drop target for drag-over events
  const setDropTarget = React.useCallback((target: { x: number; y: number } | null) => {
    setDragState((prev) => ({ ...prev, dropTarget: target }));
  }, []);

  const value = React.useMemo<DragboardContextValue>(
    () => ({
      config,
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag: _endTileDrag,
      startSidebarDrag,
      endSidebarDrag: _endSidebarDrag,
      setDropTarget,
      removeTile: _removeTile,
    }),
    [
      config,
      dragState,
      startTileDrag,
      updateTileDrag,
      _endTileDrag,
      startSidebarDrag,
      _endSidebarDrag,
      setDropTarget,
      _removeTile,
    ],
  );

  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
};
