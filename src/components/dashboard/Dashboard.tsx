import { DashboardProvider } from './DashboardContext';
import { Sidebar } from './sidebar/Sidebar';
import { DashboardContext } from './DashboardContext';
import { ErrorBoundary } from '../AppErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useContext, useCallback } from 'react';
import { useLogManager } from './log/useLogManager';
import React, { Suspense, useState, useEffect } from 'react';
import { DragboardProvider, DragboardGrid, DragboardTile } from '../dragboard';
import { DASHBOARD_GRID_CONFIG } from './dashboardGrid';
import { Tile } from './Tile';
import type { TileType } from '../../types';
import { useDashboardHotkeys } from '../../hooks/useDashboardHotkeys';
import { Header } from './Header';

function DashboardContent() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('DashboardContent must be used within DashboardProvider');
  }

  // Dynamic row count for square-like tiles
  const [rowCount, setRowCount] = useState(() => {
    const columns = DASHBOARD_GRID_CONFIG.columns;
    return Math.max(1, Math.round((window.innerHeight / window.innerWidth) * columns));
  });

  useEffect(() => {
    function handleResize() {
      const columns = DASHBOARD_GRID_CONFIG.columns;
      setRowCount(Math.max(1, Math.round((window.innerHeight / window.innerWidth) * columns)));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { state, toggleCollapse, refreshAllTiles, isRefreshing, moveTile, addTile, removeTile } =
    dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  // Use custom hook for dashboard hotkeys
  useDashboardHotkeys({ toggleLogView, refreshAllTiles, isRefreshing });

  const LogView = React.lazy(() => import('./log/LogView').then((m) => ({ default: m.LogView })));

  // Bridge Dragboard actions to DashboardContext
  const handleEndTileDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileId?: string) => {
      if (tileId && dropTarget) {
        moveTile(tileId, dropTarget);
      }
    },
    [moveTile],
  );

  const handleEndSidebarDrag = useCallback(
    async (dropTarget: { x: number; y: number } | null, tileType?: string) => {
      if (tileType && dropTarget) {
        await addTile(tileType as TileType);
      }
    },
    [addTile],
  );

  const handleRemoveTile = useCallback(
    (tileId: string) => {
      if (tileId) {
        removeTile(tileId);
      }
    },
    [removeTile],
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

      {/* Main Content Area - Fixed positioning */}
      <div className="flex h-full pt-16 relative">
        {/* Fixed Sidebar */}
        <Sidebar onToggle={toggleCollapse} />

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-auto relative scrollbar-hide">
          <DragboardProvider
            config={{ ...DASHBOARD_GRID_CONFIG, rows: rowCount }}
            endTileDrag={handleEndTileDrag}
            endSidebarDrag={handleEndSidebarDrag}
            removeTile={handleRemoveTile}
          >
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
          </DragboardProvider>
          <Suspense fallback={null}>
            <LogView isOpen={isLogViewOpen} onClose={closeLogView} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ErrorBoundary>
  );
}
