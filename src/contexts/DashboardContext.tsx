import React, { createContext, useReducer, useEffect } from 'react';
import type { TileConfig, DashboardState, DashboardContextType } from '../types/dashboard';
import { TileType } from '../types/dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

type DashboardAction =
  | { type: 'ADD_TILE'; payload: TileConfig }
  | { type: 'REMOVE_TILE'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_TILE_CONFIG'; payload: { id: string; config: Partial<TileConfig> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_STORED_STATE'; payload: DashboardState };

const initialState: DashboardState = {
  tiles: [],
  sidebarOpen: true,
  loading: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'ADD_TILE':
      return {
        ...state,
        tiles: [...state.tiles, action.payload],
      };
    case 'REMOVE_TILE':
      return {
        ...state,
        tiles: state.tiles.filter(tile => tile.id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case 'UPDATE_TILE_CONFIG':
      return {
        ...state,
        tiles: state.tiles.map(tile =>
          tile.id === action.payload.id
            ? { ...tile, ...action.payload.config }
            : tile
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'LOAD_STORED_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [storedState, setStoredState] = useLocalStorage<DashboardState>('dashboard-state', initialState);
  const [state, dispatch] = useReducer(dashboardReducer, storedState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const addTile = (type: TileType) => {
    const newTile: TileConfig = {
      id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: { x: 0, y: 0 }, // Will be calculated by grid system
      size: 'medium',
      config: {},
    };
    dispatch({ type: 'ADD_TILE', payload: newTile });
  };

  const removeTile = (id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const updateTileConfig = (id: string, config: Partial<TileConfig>) => {
    dispatch({ type: 'UPDATE_TILE_CONFIG', payload: { id, config } });
  };

  const value: DashboardContextType = {
    state,
    addTile,
    removeTile,
    toggleSidebar,
    updateTileConfig,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Export context for use in hooks
export { DashboardContext }; 
