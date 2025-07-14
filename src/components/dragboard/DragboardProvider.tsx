import React, { useReducer, useCallback, useMemo, useState } from 'react';
import { DragboardContext } from './DragboardContext';
import type {
  DragboardConfig,
  DragboardDragState,
  DragboardContextValue,
} from './DragboardContext';
import type { DashboardTile } from './dashboard.ts';
import { rearrangeTiles } from './rearrangeTiles.ts';

interface DragboardProviderProps {
  config: DragboardConfig;
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

// Board state management
interface DragboardBoardState {
  tiles: DashboardTile[];
}

type DragboardBoardAction =
  | { type: 'ADD_TILE'; payload: DashboardTile }
  | { type: 'REMOVE_TILE'; payload: string }
  | { type: 'UPDATE_TILE'; payload: { id: string; updates: Partial<DashboardTile> } }
  | { type: 'REORDER_TILES'; payload: DashboardTile[] };

const dragboardBoardReducer = (state: DragboardBoardState, action: DragboardBoardAction): DragboardBoardState => {
  switch (action.type) {
    case 'ADD_TILE':
      return { ...state, tiles: [...state.tiles, action.payload] };
    case 'REMOVE_TILE': {
      const newTiles = state.tiles.filter(tile => tile.id !== action.payload);
      return { ...state, tiles: rearrangeTiles(newTiles) };
    }
    case 'UPDATE_TILE':
      return {
        ...state,
        tiles: state.tiles.map(tile => tile.id === action.payload.id ? { ...tile, ...action.payload.updates } : tile),
      };
    case 'REORDER_TILES':
      return { ...state, tiles: action.payload };
    default:
      return state;
  }
};

export const DragboardProvider: React.FC<DragboardProviderProps> = ({
  config,
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

  // Board state
  const [boardState, dispatch] = useReducer(dragboardBoardReducer, { tiles: [] });

  // Tile drag actions
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
        // Move the tile in board state
        dispatch({ type: 'UPDATE_TILE', payload: { id: tileId, updates: { position: snappedTarget } } });
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
    [config],
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
      if (dropTarget && tileType) {
        const tileSize: 'small' | 'medium' | 'large' = 'medium';
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, config, tileSize);
        // Add a new tile to board state
        dispatch({
          type: 'ADD_TILE',
          payload: {
            id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: tileType,
            position: snappedTarget,
            size: 'medium',
            createdAt: Date.now(),
          } as DashboardTile,
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
    [config],
  );

  // Board actions
  const addTile = useCallback((tile: DashboardTile) => {
    dispatch({ type: 'ADD_TILE', payload: tile });
  }, []);

  const removeTile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
  }, []);

  const updateTile = useCallback((id: string, updates: Partial<DashboardTile>) => {
    dispatch({ type: 'UPDATE_TILE', payload: { id, updates } });
  }, []);

  const moveTile = useCallback((tileId: string, newPosition: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_TILE', payload: { id: tileId, updates: { position: newPosition } } });
  }, []);

  const reorderTiles = useCallback((tiles: DashboardTile[]) => {
    dispatch({ type: 'REORDER_TILES', payload: tiles });
  }, []);

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
      tiles: boardState.tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
    }),
    [config, dragState, startTileDrag, updateTileDrag, endTileDrag, startSidebarDrag, endSidebarDrag, setDropTarget, boardState.tiles, addTile, removeTile, updateTile, moveTile, reorderTiles],
  );

  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
};
