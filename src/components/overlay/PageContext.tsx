import React, { createContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../ui/Toast';
import { useStorageManager } from '../../services/storageManager';
import type { DashboardTile } from '../dragboard/dashboard';

interface DashboardState {
  layout: {
    isCollapsed: boolean;
  };
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
}

type DashboardAction =
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date }
  | { type: 'LOAD_STORED_STATE'; payload: DashboardState };

interface DashboardContextType {
  state: DashboardState;
  toggleCollapse: () => void;
  refreshAllTiles: () => void;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
  isInitialized: boolean;
  isCollapsed: boolean;
  // Tiles
  tiles: DashboardTile[];
  addTile: (tile: DashboardTile) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  reorderTiles: (tiles: DashboardTile[]) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
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
    isCollapsed: false,
  },
  isRefreshing: false,
  lastRefreshTime: null,
};

export const DashboardProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  // Only dashboard-specific state here
  const [state, dispatch] = useReducer(dashboardReducer, defaultState);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const hideToast = useCallback(() => setToast({ ...toast, visible: false }), [toast]);

  // --- Tile state management ---
  const storage = useStorageManager();
  const [tiles, setTiles] = React.useState<DashboardTile[]>([]);
  const [hasLoadedTiles, setHasLoadedTiles] = React.useState(false);

  type DashboardTilesStorage = { tiles: DashboardTile[] };

  // Load tiles from storage only on first mount
  useEffect(() => {
    if (!hasLoadedTiles) {
      const stored = storage.getTileConfig('dashboard-tiles');
      const data = stored?.data as DashboardTilesStorage | undefined;
      if (data && Array.isArray(data.tiles)) {
        setTiles(data.tiles);
      }
      setHasLoadedTiles(true);
    }
  }, [storage, hasLoadedTiles]);

  // Save tiles to storage whenever they change
  useEffect(() => {
    if (hasLoadedTiles) {
      storage.setTileConfig('dashboard-tiles', {
        data: { tiles },
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
    }
  }, [tiles, storage, hasLoadedTiles]);

  // Tile handlers
  const addTile = useCallback((tile: DashboardTile) => {
    setTiles((prev) => [...prev, tile]);
  }, []);

  const removeTile = useCallback((id: string) => {
    setTiles((prev) => prev.filter((tile) => tile.id !== id));
  }, []);

  const updateTile = useCallback((id: string, updates: Partial<DashboardTile>) => {
    setTiles((prev) => prev.map((tile) => (tile.id === id ? { ...tile, ...updates } : tile)));
  }, []);

  const reorderTiles = useCallback((newTiles: DashboardTile[]) => {
    setTiles(newTiles);
  }, []);

  const moveTile = useCallback((tileId: string, newPosition: { x: number; y: number }) => {
    setTiles((prev) =>
      prev.map((tile) => (tile.id === tileId ? { ...tile, position: newPosition } : tile)),
    );
  }, []);

  // Save state to storage manager whenever it changes (UI state)
  useEffect(() => {
    storage.setTileConfig('dashboard-state', {
      data: { ...state, tiles },
      lastDataRequest: Date.now(),
      lastDataRequestSuccessful: true,
    });
  }, [state, storage, tiles]);

  // Load sidebar state on mount
  useEffect(() => {
    const sidebar = storage.getSidebarState();
    if (sidebar && sidebar.isCollapsed !== state.layout.isCollapsed) {
      dispatch({ type: 'TOGGLE_COLLAPSE' });
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount
  }, []);

  // Save sidebar state when relevant changes
  useEffect(() => {
    if (!isInitialized) return;
    const activeTileTypes: string[] = tiles.map((t) => t.type); // Now tracks active tiles
    storage.setSidebarState({
      activeTiles: activeTileTypes,
      isCollapsed: state.layout.isCollapsed,
      lastUpdated: Date.now(),
    });
  }, [state.layout.isCollapsed, isInitialized, storage, tiles]);

  const toggleCollapse = useCallback(() => {
    dispatch({ type: 'TOGGLE_COLLAPSE' });
  }, []);

  const refreshAllTiles = useCallback(() => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_REFRESHING', payload: false });
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
    }, 1000);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      toggleCollapse,
      refreshAllTiles,
      isRefreshing: state.isRefreshing,
      lastRefreshTime: state.lastRefreshTime,
      isInitialized,
      isCollapsed: state.layout.isCollapsed,
      tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
    }),
    [
      state,
      toggleCollapse,
      refreshAllTiles,
      isInitialized,
      tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
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
