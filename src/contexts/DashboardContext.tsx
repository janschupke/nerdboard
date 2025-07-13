import React, { createContext } from 'react';
import type { DashboardTile, DashboardLayout, DashboardContextType } from '../types/dashboard';
import { TileType } from '../types/dashboard';
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
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };
  const hideToast = () => setToast({ ...toast, visible: false });

  const addTile = (tileOrType: DashboardTile | string) => {
    let normalizedType: DashboardTile['type'];
    if (typeof tileOrType === 'string') {
      // Handle enum values like TileType.CRYPTOCURRENCY
      const possibleType = tileOrType in TileType ? TileType[tileOrType as keyof typeof TileType] : tileOrType;
      // Only allow valid types
      normalizedType = ['cryptocurrency', 'precious-metals', 'precious_metals', 'chart'].includes(possibleType)
        ? (possibleType as DashboardTile['type'])
        : 'cryptocurrency';
    } else {
      normalizedType = tileOrType.type;
    }
    
    // Prevent duplicate tiles of the same type
    // Check both the normalized type and the original type to handle enum vs string comparison
    const hasDuplicate = state.tiles.some((tile) => {
      return tile.type === normalizedType || 
             tile.type === tileOrType || 
             (typeof tileOrType === 'string' && tile.type === TileType[tileOrType as keyof typeof TileType]);
    });
    
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
            size: 'medium',
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

  const value: DashboardContextType = {
    layout: state,
    addTile,
    removeTile,
    updateTile: updateTileConfig,
    toggleCollapse: toggleSidebar,
    setTheme: () => {}, // No-op, theme handled elsewhere
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
