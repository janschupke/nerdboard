import React, { createContext, useState, useCallback } from 'react';
import type { DashboardTile, DashboardLayout, DashboardContextType } from '../types/dashboard';
import { TileType, TileSize } from '../types/dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Toast } from '../components/ui/Toast';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

type DashboardAction =
  | { type: 'ADD_TILE'; payload: DashboardTile }
  | { type: 'REMOVE_TILE'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_TILE_CONFIG'; payload: { id: string; config: Partial<DashboardTile> } }
  | { type: 'LOAD_STORED_STATE'; payload: DashboardLayout }
  | { type: 'MOVE_TILE'; payload: { from: number; to: number } };

const initialState: DashboardLayout = {
  tiles: [],
  isCollapsed: false,
  theme: 'light',
};

function dashboardReducer(state: DashboardLayout, action: DashboardAction): DashboardLayout {
  switch (action.type) {
    case 'ADD_TILE':
      return {
        ...state,
        tiles: [...state.tiles, action.payload],
      };
    case 'REMOVE_TILE':
      return {
        ...state,
        tiles: state.tiles.filter((tile) => tile.id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isCollapsed: !state.isCollapsed,
      };
    case 'UPDATE_TILE_CONFIG':
      return {
        ...state,
        tiles: state.tiles.map((tile) =>
          tile.id === action.payload.id ? { ...tile, ...action.payload.config } : tile,
        ),
      };
    case 'LOAD_STORED_STATE':
      return action.payload;
    case 'MOVE_TILE': {
      const { from, to } = action.payload;
      const tiles = [...state.tiles];
      const [moved] = tiles.splice(from, 1);
      tiles.splice(to, 0, moved);
      return { ...state, tiles };
    }
    default:
      return state;
  }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [storedState, setStoredState] = useLocalStorage<DashboardLayout>(
    'dashboard-state',
    initialState,
  );
  const [state, dispatch] = React.useReducer(dashboardReducer, storedState);
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(new Date());

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };
  const hideToast = () => setToast({ ...toast, visible: false });

  const addTile = (tileOrType: DashboardTile | TileType) => {
    let normalizedType: TileType;
    if (typeof tileOrType === 'string') {
      // Validate that the tile type is valid
      const validTypes = Object.values(TileType);
      normalizedType = validTypes.includes(tileOrType as TileType)
        ? (tileOrType as TileType)
        : TileType.CRYPTOCURRENCY;
    } else {
      normalizedType = tileOrType.type;
    }

    // Prevent duplicate tiles of the same type
    const hasDuplicate = state.tiles.some((tile) => tile.type === normalizedType);

    if (hasDuplicate) {
      showToast('This tile is already on your dashboard.');
      return;
    }

    const newTile: DashboardTile =
      typeof tileOrType === 'string'
        ? {
            id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: normalizedType,
            position: { x: 0, y: 0 },
            size: TileSize.MEDIUM,
            config: {},
          }
        : tileOrType;
    dispatch({ type: 'ADD_TILE', payload: newTile });
  };

  const removeTile = (id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const updateTileConfig = (id: string, config: Partial<DashboardTile>) => {
    dispatch({ type: 'UPDATE_TILE_CONFIG', payload: { id, config } });
  };

  const refreshAllTiles = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Trigger refresh for all tiles
      const event = new CustomEvent('refresh-all-tiles');
      window.dispatchEvent(event);

      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Failed to refresh all tiles:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const value: DashboardContextType = {
    layout: state,
    addTile,
    removeTile,
    updateTile: updateTileConfig,
    toggleCollapse: toggleSidebar,
    setTheme: () => {}, // No-op, theme handled elsewhere
    refreshAllTiles,
    isRefreshing,
    lastRefreshTime,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
    </DashboardContext.Provider>
  );
}

// Export context for use in hooks
export { DashboardContext };
