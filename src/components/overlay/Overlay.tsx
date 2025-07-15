import React, { Suspense } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ErrorBoundary } from './ErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useLogManager } from '../api-log/useLogManager';
import { DragboardProvider, DragboardGrid, DragboardTile, useDragboard } from '../dragboard';
import { DASHBOARD_GRID_CONFIG } from './gridConfig';
import { Tile } from '../tile/Tile';
import { Header } from '../header/Header';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useStorageManager } from '../../services/storageManager';
import type { DashboardTile } from '../dragboard/dashboard';

function OverlayContent() {
  const { tiles } = useDragboard();
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  // Register hotkeys
  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles: () => {},
    isRefreshing: false,
  });

  const LogView = React.lazy(() =>
    import('../api-log/LogView').then((m) => ({ default: m.LogView })),
  );

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      <Header
        isLogViewOpen={isLogViewOpen}
        toggleLogView={toggleLogView}
        refreshAllTiles={() => {}}
        isRefreshing={false}
        toggleTheme={toggleTheme}
        theme={theme}
        toggleCollapse={() => {}}
        tilesCount={tiles.length}
      />

      {/* Main Content Area */}
      <div className="flex h-full pt-16 relative">
        {/* Fixed Sidebar */}
        <Sidebar onToggle={() => {}} />

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-auto relative scrollbar-hide">
          <DragboardGrid>
            {tiles.map((tile) => (
              <DragboardTile
                key={tile.id}
                id={tile.id}
                position={tile.position || { x: 0, y: 0 }}
                size={typeof tile.size === 'string' ? tile.size : 'medium'}
              >
                <Tile tile={tile} />
              </DragboardTile>
            ))}
          </DragboardGrid>
          <Suspense fallback={null}>
            <LogView isOpen={isLogViewOpen} onClose={closeLogView} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Simple storage wrapper for tile management
function useTileStorage() {
  const storage = useStorageManager();
  const [tiles, setTiles] = React.useState<DashboardTile[]>([]);

  // Load tiles from storage on mount
  React.useEffect(() => {
    const stored = storage.getTileConfig('dashboard-tiles');
    const data = stored?.data as { tiles: DashboardTile[] } | undefined;
    if (data && Array.isArray(data.tiles)) {
      setTiles(data.tiles);
    }
  }, [storage]);

  // Save tiles to storage whenever they change
  React.useEffect(() => {
    storage.setTileConfig('dashboard-tiles', {
      data: { tiles },
      lastDataRequest: Date.now(),
      lastDataRequestSuccessful: true,
    });
  }, [tiles, storage]);

  const addTile = React.useCallback((tile: DashboardTile) => {
    setTiles((prev) => [...prev, tile]);
  }, []);

  const removeTile = React.useCallback((id: string) => {
    setTiles((prev) => prev.filter((tile) => tile.id !== id));
  }, []);

  const updateTile = React.useCallback((id: string, updates: Partial<DashboardTile>) => {
    setTiles((prev) => prev.map((tile) => (tile.id === id ? { ...tile, ...updates } : tile)));
  }, []);

  const moveTile = React.useCallback((tileId: string, newPosition: { x: number; y: number }) => {
    setTiles((prev) =>
      prev.map((tile) => (tile.id === tileId ? { ...tile, position: newPosition } : tile)),
    );
  }, []);

  const reorderTiles = React.useCallback((newTiles: DashboardTile[]) => {
    setTiles(newTiles);
  }, []);

  return { tiles, addTile, removeTile, updateTile, moveTile, reorderTiles };
}

export function Overlay() {
  const tileStorage = useTileStorage();

  return (
    <ErrorBoundary variant="app">
      <DragboardProvider
        config={DASHBOARD_GRID_CONFIG}
        tiles={tileStorage.tiles}
        addTile={tileStorage.addTile}
        removeTile={tileStorage.removeTile}
        updateTile={tileStorage.updateTile}
        moveTile={tileStorage.moveTile}
        reorderTiles={tileStorage.reorderTiles}
      >
        <OverlayContent />
      </DragboardProvider>
    </ErrorBoundary>
  );
}
