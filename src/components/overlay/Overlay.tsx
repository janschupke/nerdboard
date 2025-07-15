import React, { Suspense, useState, useCallback } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ErrorBoundary } from './ErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useLogManager } from '../api-log/useLogManager';
import { DragboardProvider, DragboardGrid, DragboardTile } from '../dragboard';
import { DASHBOARD_GRID_CONFIG } from './gridConfig';
import { Tile } from '../tile/Tile';
import { Header } from '../header/Header';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useStorageManager } from '../../services/storageManager';
import type { DragboardTileData } from '../dragboard';

function OverlayContent({
  tiles,
  addTile,
  removeTile,
  isSidebarCollapsed,
  setSidebarCollapsed,
  sidebarSelectedIndex,
  setSidebarSelectedIndex,
}: {
  tiles: DragboardTileData[];
  addTile: (tile: DragboardTileData) => void;
  removeTile: (id: string) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarSelectedIndex: number;
  setSidebarSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh all tiles function
  const refreshAllTiles = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Increment refresh key to trigger re-renders of all tiles
      setRefreshKey(prev => prev + 1);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Register hotkeys
  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
    selectedIndex: sidebarSelectedIndex,
    setSelectedIndex: setSidebarSelectedIndex,
  });

  // TODO: what is this?
  const LogView = React.lazy(() =>
    import('../api-log/LogView').then((m) => ({ default: m.LogView })),
  );

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      <Header
        isLogViewOpen={isLogViewOpen}
        toggleLogView={toggleLogView}
        toggleTheme={toggleTheme}
        theme={theme}
        toggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        tilesCount={tiles.length}
        refreshAllTiles={refreshAllTiles}
        isRefreshing={isRefreshing}
      />
      <div className="flex h-full pt-16 relative">
        {/* Always render Sidebar for hotkey support and animation */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed((prev) => !prev)}
          selectedIndex={sidebarSelectedIndex}
          setSelectedIndex={setSidebarSelectedIndex}
          tiles={tiles}
          addTile={addTile}
          removeTile={removeTile}
        />
        <main
          className="overflow-auto relative scrollbar-hide transition-all duration-300 ease-in-out"
          style={{
            width: isSidebarCollapsed ? '100%' : 'calc(100% - 256px)',
            marginLeft: 0,
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <DragboardGrid>
            {tiles.map((tile) => (
              <DragboardTile
                key={tile.id}
                id={tile.id}
                position={tile.position || { x: 0, y: 0 }}
                size={typeof tile.size === 'string' ? tile.size : 'medium'}
              >
                <Tile tile={tile} refreshKey={refreshKey} />
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

function useTileStorage() {
  const storage = useStorageManager();
  const [initialTiles, setInitialTiles] = React.useState<DragboardTileData[]>([]);

  // Load tiles from storage on mount (only once)
  React.useEffect(() => {
    const dashboard = storage.getDashboardState();
    if (dashboard && Array.isArray(dashboard.tiles)) {
      setInitialTiles(
        dashboard.tiles.map((tile) => ({
          ...tile,
          type: tile.type as DragboardTileData['type'],
          size: tile.size as DragboardTileData['size'],
          createdAt: typeof tile.createdAt === 'number' ? tile.createdAt : Date.now(),
          config: tile.config || {},
        })),
      );
    }
  }, [storage]);

  return { initialTiles, storage };
}

function TilePersistenceListener({
  storage,
  tiles,
}: {
  storage: ReturnType<typeof useStorageManager>;
  tiles: DragboardTileData[];
}) {
  const prevTilesRef = React.useRef<DragboardTileData[] | null>(null);

  React.useEffect(() => {
    const prevTiles = prevTilesRef.current;
    const shouldPersist =
      tiles.length > 0 || (prevTiles && prevTiles.length > 0 && tiles.length === 0);
    if (shouldPersist) {
      storage.setDashboardState({
        tiles: tiles.map((tile) => ({
          id: tile.id,
          type: tile.type as string,
          position: tile.position,
          size: tile.size as string,
          createdAt: typeof tile.createdAt === 'number' ? tile.createdAt : Date.now(),
          config: tile.config || {},
        })),
      });
    }
    prevTilesRef.current = tiles;
  }, [tiles, storage]);
  return null;
}

export function Overlay() {
  const { initialTiles, storage } = useTileStorage();
  const [tiles, setTiles] = React.useState<DragboardTileData[]>(initialTiles);
  // Sync tiles state with initialTiles when it changes (e.g., after storage loads)
  React.useEffect(() => {
    setTiles(initialTiles);
  }, [initialTiles]);
  const [isSidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [sidebarSelectedIndex, setSidebarSelectedIndex] = React.useState(0);

  // Tile actions
  const addTile = (tile: DragboardTileData) => setTiles((prev) => [...prev, tile]);
  const removeTile = (id: string) => setTiles((prev) => prev.filter((t) => t.id !== id));

  return (
    <ErrorBoundary variant="app">
      <DragboardProvider config={DASHBOARD_GRID_CONFIG} initialTiles={tiles}>
        <TilePersistenceListener storage={storage} tiles={tiles} />
        <OverlayContent
          tiles={tiles}
          addTile={addTile}
          removeTile={removeTile}
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          sidebarSelectedIndex={sidebarSelectedIndex}
          setSidebarSelectedIndex={setSidebarSelectedIndex}
        />
      </DragboardProvider>
    </ErrorBoundary>
  );
}
