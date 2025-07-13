import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { DashboardTile, TileType } from '../types/dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Toast } from '../components/ui/Toast';

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
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date }
  | { type: 'LOAD_STORED_STATE'; payload: DashboardState };

interface DashboardContextType {
  state: DashboardState;
  addTile: (tileType: TileType) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
  toggleCollapse: () => void;
  refreshAllTiles: () => void;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
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
    case 'REMOVE_TILE':
      return {
        ...state,
        layout: {
          ...state.layout,
          tiles: state.layout.tiles.filter((tile: DashboardTile) => tile.id !== action.payload),
        },
      };
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

    return {
      layout: validatedLayout,
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

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => setToast({ ...toast, visible: false }), [toast]);

  const addTile = useCallback(
    (tileType: TileType) => {
      // Prevent duplicate tiles of the same type
      const hasDuplicate = state.layout.tiles.some((tile) => tile.type === tileType);

      if (hasDuplicate) {
        showToast('This tile is already on your dashboard.');
        return;
      }

      // Find first available position
      const grid = Array(4).fill(null).map(() => Array(6).fill(false));
      
      // Mark occupied positions
      state.layout.tiles.forEach((tile) => {
        if (tile.position) {
          const { x, y } = tile.position;
          const size = typeof tile.size === 'string' ? tile.size : 'medium';
          const spanX = size === 'large' ? 3 : 2;
          const spanY = size === 'large' ? 3 : 2;
          
          for (let i = y; i < Math.min(y + spanY, 4); i++) {
            for (let j = x; j < Math.min(x + spanX, 6); j++) {
              if (grid[i] && grid[i][j] !== undefined) {
                grid[i][j] = true;
              }
            }
          }
        }
      });
      
      // Find first available position
      let newPosition = { x: 0, y: 0 };
      const spanX = 2; // Default medium size
      const spanY = 2;
      
      outer: for (let y = 0; y <= 4 - spanY; y++) {
        for (let x = 0; x <= 6 - spanX; x++) {
          let canPlace = true;
          for (let i = y; i < y + spanY; i++) {
            for (let j = x; j < x + spanX; j++) {
              if (grid[i][j]) {
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
      };

      dispatch({ type: 'ADD_TILE', payload: newTile });
    },
    [state.layout.tiles, showToast],
  );

  const removeTile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
    
    // Trigger compaction after removal
    setTimeout(() => {
      const updatedTiles = state.layout.tiles.filter(tile => tile.id !== id);
      if (updatedTiles.length > 0) {
        // Reposition all remaining tiles to fill gaps
        const grid = Array(12).fill(null).map(() => Array(8).fill(false));
        const repositionedTiles: DashboardTile[] = [];
        
        updatedTiles.forEach((tile) => {
          const size = typeof tile.size === 'string' ? tile.size : 'medium';
          const spanX = size === 'large' ? 2 : 1;
          const spanY = size === 'large' ? 1 : 1;
          
          // Find first available position
          let newPosition = { x: 0, y: 0 };
          outer: for (let y = 0; y <= 12 - spanY; y++) {
            for (let x = 0; x <= 8 - spanX; x++) {
              let canPlace = true;
              for (let i = y; i < y + spanY; i++) {
                for (let j = x; j < x + spanX; j++) {
                  if (grid[i][j]) {
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
          
          // Mark position as occupied
          for (let i = newPosition.y; i < newPosition.y + spanY; i++) {
            for (let j = newPosition.x; j < newPosition.x + spanX; j++) {
              if (grid[i] && grid[i][j] !== undefined) {
                grid[i][j] = true;
              }
            }
          }
          
          repositionedTiles.push({
            ...tile,
            position: newPosition
          });
        });
        
        // Update all tiles with new positions
        repositionedTiles.forEach((tile) => {
          dispatch({ type: 'UPDATE_TILE', payload: { id: tile.id, updates: { position: tile.position } } });
        });
      }
    }, 0);
  }, [state.layout.tiles]);

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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      toggleCollapse,
      refreshAllTiles,
      isRefreshing: state.isRefreshing,
      lastRefreshTime: state.lastRefreshTime,
    }),
    [state, addTile, removeTile, updateTile, moveTile, toggleCollapse, refreshAllTiles],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
    </DashboardContext.Provider>
  );
});

export { DashboardContext };
