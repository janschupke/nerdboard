import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { DashboardTile, TileType } from '../types/dashboard';

interface DashboardState {
  tiles: DashboardTile[];
  layout: {
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
  | { type: 'SET_LAST_REFRESH'; payload: Date };

interface DashboardContextType {
  state: DashboardState;
  addTile: (tileType: TileType) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
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
        tiles: [...state.tiles, action.payload],
      };
    case 'REMOVE_TILE':
      return {
        ...state,
        tiles: state.tiles.filter((tile: DashboardTile) => tile.id !== action.payload),
      };
    case 'UPDATE_TILE':
      return {
        ...state,
        tiles: state.tiles.map((tile: DashboardTile) =>
          tile.id === action.payload.id ? { ...tile, ...action.payload.updates } : tile
        ),
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
    default:
      return state;
  }
};

export const DashboardProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    tiles: [],
    layout: {
      isCollapsed: false,
    },
    isRefreshing: false,
    lastRefreshTime: null,
  });

  const addTile = useCallback((tileType: TileType) => {
    const newTile: DashboardTile = {
      id: `tile-${Date.now()}`,
      type: tileType,
      position: { x: 0, y: 0 },
      size: 'medium',
    };
    dispatch({ type: 'ADD_TILE', payload: newTile });
  }, []);

  const removeTile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
  }, []);

  const updateTile = useCallback((id: string, updates: Partial<DashboardTile>) => {
    dispatch({ type: 'UPDATE_TILE', payload: { id, updates } });
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
  const contextValue = useMemo(() => ({
    state,
    addTile,
    removeTile,
    updateTile,
    toggleCollapse,
    refreshAllTiles,
    isRefreshing: state.isRefreshing,
    lastRefreshTime: state.lastRefreshTime,
  }), [state, addTile, removeTile, updateTile, toggleCollapse, refreshAllTiles]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
});

export { DashboardContext };
