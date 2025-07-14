import React, { createContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import type { DashboardTile, TileType } from '../types/dashboard';
import { Toast } from '../components/ui/Toast';
import { getTileSpan, DASHBOARD_GRID_CONFIG } from '../constants/dashboardGrid';
import { useStorageManager } from '../services/storageManagerUtils';

// Helper function to rearrange tiles after removal
const rearrangeTiles = (tiles: DashboardTile[]): DashboardTile[] => {
  if (tiles.length === 0) return tiles;

  // Sort tiles by creation time to maintain order
  const sortedTiles = [...tiles].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const GRID_ROWS = DASHBOARD_GRID_CONFIG.rows;
  const GRID_COLUMNS = DASHBOARD_GRID_CONFIG.columns;
  const grid = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLUMNS).fill(false));

  const rearrangedTiles: DashboardTile[] = [];

  for (const tile of sortedTiles) {
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan, rowSpan } = getTileSpan(size);

    // Find first available position for this tile
    let newPosition = { x: 0, y: 0 };
    let found = false;

    outer: for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
      for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
        let canPlace = true;
        for (let i = y; i < y + rowSpan; i++) {
          for (let j = x; j < x + colSpan; j++) {
            if (grid[i] && grid[i][j]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) {
          newPosition = { x, y };
          found = true;
          break outer;
        }
      }
    }

    if (found) {
      // Mark the position as occupied
      for (let i = newPosition.y; i < newPosition.y + rowSpan; i++) {
        for (let j = newPosition.x; j < newPosition.x + colSpan; j++) {
          if (grid[i] && grid[i][j] !== undefined) {
            grid[i][j] = true;
          }
        }
      }

      // Add tile with new position
      rearrangedTiles.push({
        ...tile,
        position: newPosition,
      });
    }
  }

  return rearrangedTiles;
};

interface DashboardState {
  layout: {
    tiles: DashboardTile[];
    isCollapsed: boolean;
  };
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
}

type DashboardAction =
  | { type: 'ADD_TILE'; payload: DashboardTile }
  | { type: 'REMOVE_TILE'; payload: string }
  | { type: 'UPDATE_TILE'; payload: { id: string; updates: Partial<DashboardTile> } }
  | { type: 'REORDER_TILES'; payload: DashboardTile[] }
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date }
  | { type: 'LOAD_STORED_STATE'; payload: DashboardState };

interface DashboardContextType {
  state: DashboardState;
  addTile: (tileType: TileType) => Promise<void>;
  removeTile: (id: string | TileType) => Promise<void>;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
  reorderTiles: (tiles: DashboardTile[]) => void;
  toggleCollapse: () => void;
  refreshAllTiles: () => void;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
  isTileActive: (tileType: TileType) => boolean;
  getActiveTileTypes: () => TileType[];
  isInitialized: boolean;
  saveSidebarState: () => Promise<void>;
  loadSidebarState: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'ADD_TILE':
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: [...state.layout.tiles, action.payload],
        },
      };
    case 'REMOVE_TILE': {
      const newTiles = state.layout.tiles.filter(
        (tile: DashboardTile) => tile.id !== action.payload,
      );
      const rearrangedTiles = rearrangeTiles(newTiles);
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: rearrangedTiles,
        },
      };
    }
    case 'UPDATE_TILE':
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: state.layout.tiles.map((tile: DashboardTile) =>
            tile.id === action.payload.id ? { ...tile, ...action.payload.updates } : tile,
          ),
        },
      };
    case 'REORDER_TILES':
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: action.payload,
        },
      };
    case 'TOGGLE_COLLAPSE':
      return {
        ...state,
        layout: {
          ...state.layout,
          isCollapsed: !state.layout.isCollapsed,
        },
      };
    case 'SET_REFRESHING':
      return {
        ...state,
        isRefreshing: action.payload,
      };
    case 'SET_LAST_REFRESH':
      return {
        ...state,
        lastRefreshTime: action.payload,
      };
    case 'LOAD_STORED_STATE':
      return action.payload;
    default:
      return state;
  }
};

const defaultState: DashboardState = {
  layout: {
    tiles: [],
    isCollapsed: false,
  },
  isRefreshing: false,
  lastRefreshTime: null,
};

export const DashboardProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const storage = useStorageManager();
  // Load initial state from storage manager
  const getInitialState = () => {
    const stored = storage.getTileConfig('dashboard-state');
    if (stored && stored.data) return stored.data as unknown as DashboardState;
    return defaultState;
  };
  const [state, dispatch] = useReducer(dashboardReducer, getInitialState());
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);
  const hideToast = useCallback(() => setToast({ ...toast, visible: false }), [toast]);

  // Save state to storage manager whenever it changes
  useEffect(() => {
    storage.setTileConfig('dashboard-state', {
      data: state as unknown as Record<string, unknown>,
      lastDataRequest: Date.now(),
      lastDataRequestSuccessful: true,
    });
  }, [state, storage]);

  // Load sidebar state on mount
  useEffect(() => {
    const sidebar = storage.getSidebarState();
    if (sidebar && sidebar.isCollapsed !== state.layout.isCollapsed) {
      dispatch({ type: 'TOGGLE_COLLAPSE' });
    }
    setIsInitialized(true);
  }, [storage, state.layout.isCollapsed]);

  // Save sidebar state when relevant changes
  useEffect(() => {
    if (!isInitialized) return;
    const activeTileTypes = state.layout.tiles.map((tile) => tile.type);
    storage.setSidebarState({
      activeTiles: activeTileTypes,
      isCollapsed: state.layout.isCollapsed,
      lastUpdated: Date.now(),
    });
  }, [state.layout.tiles, state.layout.isCollapsed, isInitialized, storage]);

  const addTile = useCallback(
    async (tileType: TileType) => {
      // Prevent duplicate tiles of the same type
      const hasDuplicate = state.layout.tiles.some((tile) => tile.type === tileType);

      if (hasDuplicate) {
        showToast('This tile is already on your dashboard.');
        return;
      }

      // Find first available position using unified tile size system
      const GRID_ROWS = DASHBOARD_GRID_CONFIG.rows;
      const GRID_COLUMNS = DASHBOARD_GRID_CONFIG.columns;
      const grid = Array(GRID_ROWS)
        .fill(null)
        .map(() => Array(GRID_COLUMNS).fill(false));

      // Mark occupied positions
      state.layout.tiles.forEach((tile) => {
        if (tile.position) {
          const { x, y } = tile.position;
          const size = typeof tile.size === 'string' ? tile.size : 'medium';
          const { colSpan, rowSpan } = getTileSpan(size);

          for (let i = y; i < Math.min(y + rowSpan, GRID_ROWS); i++) {
            for (let j = x; j < Math.min(x + colSpan, GRID_COLUMNS); j++) {
              if (grid[i] && grid[i][j] !== undefined) {
                grid[i][j] = true;
              }
            }
          }
        }
      });

      // Find first available position for medium tile
      const { colSpan, rowSpan } = getTileSpan('medium');
      let newPosition = { x: 0, y: 0 };

      outer: for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
        for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
          let canPlace = true;
          for (let i = y; i < y + rowSpan; i++) {
            for (let j = x; j < x + colSpan; j++) {
              if (grid[i] && grid[i][j]) {
                canPlace = false;
                break;
              }
            }
            if (!canPlace) break;
          }
          if (canPlace) {
            newPosition = { x, y };
            break outer;
          }
        }
      }

      const newTile: DashboardTile = {
        id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: tileType,
        position: newPosition,
        size: 'medium',
        createdAt: Date.now(),
      };

      dispatch({ type: 'ADD_TILE', payload: newTile });
    },
    [state.layout.tiles, showToast],
  );

  const removeTile = useCallback(
    async (tileTypeOrId: string | TileType) => {
      // Accept either a tile id or a tile type
      let tileId = tileTypeOrId;
      if (typeof tileTypeOrId === 'string') {
        // Check if this is already a tile ID (starts with 'tile-')
        if (!tileTypeOrId.startsWith('tile-')) {
          // This is a tile type, find the tile by type
          const found = state.layout.tiles.find((tile) => tile.type === tileTypeOrId);
          if (found) {
            tileId = found.id;
          } else {
            return;
          }
        }
      }

      dispatch({ type: 'REMOVE_TILE', payload: tileId });
    },
    [state.layout.tiles],
  );

  const updateTile = useCallback((id: string, updates: Partial<DashboardTile>) => {
    dispatch({ type: 'UPDATE_TILE', payload: { id, updates } });
  }, []);

  const moveTile = useCallback((tileId: string, newPosition: { x: number; y: number }) => {
    dispatch({
      type: 'UPDATE_TILE',
      payload: { id: tileId, updates: { position: newPosition } },
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    dispatch({ type: 'TOGGLE_COLLAPSE' });
  }, []);

  const refreshAllTiles = useCallback(() => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    // Simulate refresh
    setTimeout(() => {
      dispatch({ type: 'SET_REFRESHING', payload: false });
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
    }, 1000);
  }, []);

  const reorderTiles = useCallback((tiles: DashboardTile[]) => {
    dispatch({ type: 'REORDER_TILES', payload: tiles });
  }, []);

  const isTileActive = useCallback(
    (tileType: TileType) => {
      return state.layout.tiles.some((tile) => tile.type === tileType);
    },
    [state.layout.tiles],
  );

  const getActiveTileTypes = useCallback(() => {
    return state.layout.tiles.map((tile) => tile.type);
  }, [state.layout.tiles]);

  const saveSidebarState = useCallback(async () => {
    try {
      const activeTileTypes = state.layout.tiles.map((tile) => tile.type);
      await storage.setSidebarState({
        activeTiles: activeTileTypes,
        isCollapsed: state.layout.isCollapsed,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
      throw error;
    }
  }, [state.layout.tiles, state.layout.isCollapsed, storage]);

  const loadSidebarState = useCallback(async () => {
    try {
      const savedState = await storage.getSidebarState();
      if (savedState) {
        // Note: We don't restore tiles here as they're managed by the dashboard state
        // The sidebar will use this information for visual state
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
      throw error;
    }
  }, [storage]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
      toggleCollapse,
      refreshAllTiles,
      isRefreshing: state.isRefreshing,
      lastRefreshTime: state.lastRefreshTime,
      isTileActive,
      getActiveTileTypes,
      isInitialized,
      saveSidebarState,
      loadSidebarState,
    }),
    [
      state,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
      toggleCollapse,
      refreshAllTiles,
      isTileActive,
      getActiveTileTypes,
      isInitialized,
      saveSidebarState,
      loadSidebarState,
    ],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
    </DashboardContext.Provider>
  );
});

export { DashboardContext };
