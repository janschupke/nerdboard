import React, { createContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import type { DashboardTile, TileType } from '../types/dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Toast } from '../components/ui/Toast';
import { getTileSpan } from '../constants/gridSystem';
import { sidebarStorage } from '../utils/sidebarStorage';

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
      const newTiles = state.layout.tiles.filter((tile: DashboardTile) => tile.id !== action.payload);
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: newTiles,
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
  const [storedState, setStoredState] = useLocalStorage<DashboardState>(
    'dashboard-state',
    defaultState,
  );

  // Add initialization state
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Validate and normalize stored state
  const validatedState: DashboardState = React.useMemo(() => {
    if (!storedState || typeof storedState !== 'object') {
      return defaultState;
    }

    // Ensure layout exists and has required properties
    const layout = storedState.layout || {};
    const validatedLayout = {
      tiles: Array.isArray(layout.tiles) ? layout.tiles : [],
      isCollapsed: typeof layout.isCollapsed === 'boolean' ? layout.isCollapsed : false,
    };

    // Migrate existing tiles to have createdAt property
    const migratedTiles = validatedLayout.tiles.map((tile: DashboardTile, index: number) => {
      if (!tile.createdAt) {
        // Try to extract timestamp from tile ID, or use index as fallback
        const idMatch = tile.id.match(/tile-(\d+)-/);
        const timestamp = idMatch ? parseInt(idMatch[1], 10) : Date.now() - index * 1000;
        return { ...tile, createdAt: timestamp };
      }
      return tile;
    });

    return {
      layout: {
        ...validatedLayout,
        tiles: migratedTiles,
      },
      isRefreshing:
        typeof storedState.isRefreshing === 'boolean' ? storedState.isRefreshing : false,
      lastRefreshTime:
        storedState.lastRefreshTime instanceof Date ? storedState.lastRefreshTime : null,
    };
  }, [storedState]);

  const [state, dispatch] = useReducer(dashboardReducer, validatedState);
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => setToast({ ...toast, visible: false }), [toast]);

  // Load sidebar state on mount
  useEffect(() => {
    const initializeSidebarState = async () => {
      try {
        const savedSidebarState = await sidebarStorage.loadSidebarState();
        if (savedSidebarState) {
          // Note: We don't restore tiles here as they're managed by the dashboard state
          // The sidebar will use this information for visual state
        }
      } catch (error) {
        console.error('Failed to initialize sidebar state:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSidebarState();
  }, []);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  // Debounced save of sidebar state
  React.useEffect(() => {
    if (!isInitialized) return;

    const saveSidebarState = async () => {
      try {
        const activeTileTypes = state.layout.tiles.map(tile => tile.type);
        await sidebarStorage.saveSidebarState({
          activeTiles: activeTileTypes,
          isCollapsed: state.layout.isCollapsed,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
        showToast('Failed to save sidebar preferences');
      }
    };

    // Debounce save operations
    const timeoutId = setTimeout(saveSidebarState, 500);
    return () => clearTimeout(timeoutId);
  }, [state.layout.tiles, state.layout.isCollapsed, isInitialized, showToast]);

  const addTile = useCallback(
    async (tileType: TileType) => {
      // Prevent duplicate tiles of the same type
      const hasDuplicate = state.layout.tiles.some((tile) => tile.type === tileType);

      if (hasDuplicate) {
        showToast('This tile is already on your dashboard.');
        return;
      }

      // Find first available position using unified tile size system
      const GRID_ROWS = 12;
      const GRID_COLUMNS = 8;
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

  const isTileActive = useCallback((tileType: TileType) => {
    return state.layout.tiles.some((tile) => tile.type === tileType);
  }, [state.layout.tiles]);

  const getActiveTileTypes = useCallback(() => {
    return state.layout.tiles.map((tile) => tile.type);
  }, [state.layout.tiles]);

  const saveSidebarState = useCallback(async () => {
    try {
      const activeTileTypes = state.layout.tiles.map(tile => tile.type);
      await sidebarStorage.saveSidebarState({
        activeTiles: activeTileTypes,
        isCollapsed: state.layout.isCollapsed,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
      throw error;
    }
  }, [state.layout.tiles, state.layout.isCollapsed]);

  const loadSidebarState = useCallback(async () => {
    try {
      const savedState = await sidebarStorage.loadSidebarState();
      if (savedState) {
        // Note: We don't restore tiles here as they're managed by the dashboard state
        // The sidebar will use this information for visual state
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
      throw error;
    }
  }, []);

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
