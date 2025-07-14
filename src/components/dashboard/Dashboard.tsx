import { DashboardProvider } from '../../contexts/DashboardContext';
import { Sidebar } from './Sidebar';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Icon } from '../ui/Icon';
import { ErrorBoundary } from '../ErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useContext, useCallback } from 'react';
import { DragboardContext } from '../dragboard/DragboardContext';
import { LogButton } from './LogButton';
import { useLogManager } from '../../hooks/useLogManager';
import React, { Suspense } from 'react';
import { DragboardProvider, DragboardGrid, DragboardTile } from '../dragboard';
import type { DragboardConfig } from '../dragboard';
import { Tile } from './Tile';

const dragboardConfig: DragboardConfig = {
  columns: 8,
  rows: 12,
  tileSizes: {
    small: { colSpan: 2, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 1 },
    large: { colSpan: 4, rowSpan: 1 },
  },
  breakpoints: { sm: 640, md: 768, lg: 1024 },
};

function DashboardContent() {
  const dashboardContext = useContext(DashboardContext);
  const dragboardContext = useContext(DragboardContext);
  if (!dashboardContext) {
    throw new Error('DashboardContent must be used within DashboardProvider');
  }

  const { state, toggleCollapse, refreshAllTiles, isRefreshing, moveTile, addTile, removeTile } = dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  const LogView = React.lazy(() => import('./LogView').then((m) => ({ default: m.LogView })));

  // Bridge Dragboard actions to DashboardContext
  const handleEndTileDrag = useCallback((dropTarget: { x: number; y: number } | null, tileId?: string) => {
    if (tileId && dropTarget) {
      moveTile(tileId, dropTarget);
    }
  }, [moveTile]);

  const handleEndSidebarDrag = useCallback(async (dropTarget: { x: number; y: number } | null, tileType?: string) => {
    if (tileType && dropTarget) {
      await addTile(tileType, dropTarget);
    }
  }, [addTile]);

  const handleRemoveTile = useCallback((tileId: string) => {
    if (tileId) {
      removeTile(tileId);
    }
  }, [removeTile]);

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-theme-primary px-4 py-3 flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleCollapse}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size="md" />
          </button>
          <h1 className="text-xl font-semibold text-theme-primary">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <LogButton isOpen={isLogViewOpen} onToggle={toggleLogView} />
          <button
            onClick={refreshAllTiles}
            disabled={isRefreshing}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh all tiles"
          >
            <Icon name="refresh" size="md" className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
          </button>
          <span className="text-sm text-theme-secondary">{tiles.length} tiles</span>
        </div>
      </header>

      {/* Main Content Area - Fixed positioning */}
      <div className="flex h-full pt-16 relative">
        {/* Fixed Sidebar */}
        <Sidebar onToggle={toggleCollapse} />

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-auto relative scrollbar-hide">
          <DragboardProvider
            config={dragboardConfig}
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
