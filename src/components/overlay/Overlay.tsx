import { DashboardProvider } from './PageContext';
import { Sidebar } from '../sidebar/Sidebar';
import { DashboardContext } from './PageContext';
import { ErrorBoundary } from './AppErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useContext, useMemo } from 'react';
import { useLogManager } from '../api-log/useLogManager';
import React, { Suspense, useState, useEffect } from 'react';
import { DragboardProvider, DragboardGrid, DragboardTile } from '../dragboard';
import { DASHBOARD_GRID_CONFIG } from './gridConfig';
import { Tile } from '../tile/Tile';
import { Header } from './Header';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

function DashboardContent() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('DashboardContent must be used within DashboardProvider');
  }
  const {
    tiles,
    addTile,
    removeTile,
    updateTile,
    moveTile,
    reorderTiles,
    toggleCollapse,
    refreshAllTiles,
    isRefreshing,
  } = dashboardContext;
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  // Register hotkeys here
  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
  });

  // Memoize the tiles rendering to prevent unnecessary re-renders
  const tilesElements = useMemo(() => {
    return tiles.map((tile) => (
      <DragboardTile
        key={tile.id}
        id={tile.id}
        position={tile.position || { x: 0, y: 0 }}
        size={typeof tile.size === 'string' ? tile.size : 'medium'}
      >
        <Tile tile={tile} />
      </DragboardTile>
    ));
  }, [tiles]);

  const LogView = React.lazy(() => import('../api-log/LogView').then((m) => ({ default: m.LogView })));

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
            config={DASHBOARD_GRID_CONFIG}
            tiles={tiles}
            addTile={addTile}
            removeTile={removeTile}
            updateTile={updateTile}
            moveTile={moveTile}
            reorderTiles={reorderTiles}
          >
            <DragboardGrid>
              {tilesElements}
            </DragboardGrid>
            <Suspense fallback={null}>
              <LogView isOpen={isLogViewOpen} onClose={closeLogView} />
            </Suspense>
          </DragboardProvider>
        </main>
      </div>
    </div>
  );
}

export function Dashboard() {
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

  // Pass the correct config with dynamic rows
  const dragboardConfig = { ...DASHBOARD_GRID_CONFIG, rows: rowCount };

  return (
    <ErrorBoundary>
      <DashboardProvider>
        <DragboardProvider
          config={dragboardConfig}
          tiles={[]}
          addTile={() => {}}
          removeTile={() => {}}
          updateTile={() => {}}
          moveTile={() => {}}
          reorderTiles={() => {}}
        >
          <DashboardContent />
        </DragboardProvider>
      </DashboardProvider>
    </ErrorBoundary>
  );
}
