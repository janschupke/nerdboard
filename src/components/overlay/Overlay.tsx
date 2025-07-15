import React, { Suspense, useState } from 'react';
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
import type { DashboardTile } from '../dragboard';

function OverlayContent() {
  const { tiles, refreshAllTiles, isRefreshing, refreshKey } = useDragboard();
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  // Sidebar collapsed state and selected index
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSelectedIndex, setSidebarSelectedIndex] = useState(0);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  // Register hotkeys
  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
  });

  const LogView = React.lazy(() =>
    import('../api-log/LogView').then((m) => ({ default: m.LogView })),
  );

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      <Header
        isLogViewOpen={isLogViewOpen}
        toggleLogView={toggleLogView}
        refreshAllTiles={refreshAllTiles}
        isRefreshing={isRefreshing}
        toggleTheme={toggleTheme}
        theme={theme}
        toggleCollapse={toggleCollapse}
        tilesCount={tiles.length}
      />
      <div className="flex h-full pt-16 relative">
        {/* Always render Sidebar for hotkey support and animation */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed((prev) => !prev)}
          selectedIndex={sidebarSelectedIndex}
          setSelectedIndex={setSidebarSelectedIndex}
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
                {/* Pass refreshKey as a prop to force tile reload on refresh */}
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

// Fixed storage wrapper for tile management
function useTileStorage() {
  const storage = useStorageManager();
  const [initialTiles, setInitialTiles] = React.useState<DashboardTile[]>([]);

  // Load tiles from storage on mount (only once)
  React.useEffect(() => {
    const dashboard = storage.getDashboardState();
    if (dashboard && Array.isArray(dashboard.tiles)) {
      setInitialTiles(
        dashboard.tiles.map((tile) => ({
          ...tile,
          type: tile.type as DashboardTile['type'],
          size: tile.size as DashboardTile['size'],
          createdAt: typeof tile.createdAt === 'number' ? tile.createdAt : Date.now(),
          config: tile.config || {},
        })),
      );
    }
  }, [storage]);

  return { initialTiles, storage };
}

function TilePersistenceListener({ storage }: { storage: ReturnType<typeof useStorageManager> }) {
  const { tiles } = useDragboard();
  const prevTilesRef = React.useRef<DashboardTile[] | null>(null);

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
  return (
    <ErrorBoundary variant="app">
      <DragboardProvider config={DASHBOARD_GRID_CONFIG} initialTiles={initialTiles}>
        <TilePersistenceListener storage={storage} />
        <OverlayContent />
      </DragboardProvider>
    </ErrorBoundary>
  );
}
