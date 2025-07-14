import React, { createContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../ui/Toast';
import { useStorageManager } from '../../services/storageManager';

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
  // Add any other dashboard-specific actions/state here
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

  const storage = useStorageManager();

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
  }, []);

  // Save sidebar state when relevant changes
  useEffect(() => {
    if (!isInitialized) return;
    const activeTileTypes: string[] = []; // No longer managing tiles here
    storage.setSidebarState({
      activeTiles: activeTileTypes,
      isCollapsed: state.layout.isCollapsed,
      lastUpdated: Date.now(),
    });
  }, [state.layout.isCollapsed, isInitialized, storage]);

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
      // ... add any other dashboard-specific actions/state here ...
    }),
    [state, toggleCollapse, refreshAllTiles, isInitialized],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />
    </DashboardContext.Provider>
  );
});

export { DashboardContext };
