import React, { useCallback } from 'react';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { TileGrid } from './TileGrid';
import { Sidebar } from './Sidebar';
import { DashboardContext } from '../../contexts/DashboardContext';
import { TileType } from '../../types/dashboard';
import { EnhancedTopPanel } from './EnhancedTopPanel';

/**
 * Main dashboard content component that renders the dashboard layout
 * including the header, sidebar, and tile grid.
 *
 * @returns {JSX.Element} The dashboard content component
 */
const DashboardContent = React.memo(() => {
  const dashboardContext = React.useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('DashboardContent must be used within DashboardProvider');
  }

  const { state, addTile, toggleCollapse, refreshAllTiles, isRefreshing, lastRefreshTime } =
    dashboardContext;
  const { isCollapsed } = state.layout;

  // Memoize handler to prevent recreation
  const handleTileSelect = useCallback((tileType: TileType) => {
    addTile(tileType);
  }, [addTile]);

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      {/* Enhanced Top Panel */}
      <EnhancedTopPanel
        onRefreshAll={refreshAllTiles}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime || undefined}
      />
      {/* Main Content Area - Fixed positioning */}
      <div className="flex h-full pt-16">
        {/* Fixed Sidebar */}
        <Sidebar isOpen={!isCollapsed} onToggle={toggleCollapse} onTileSelect={handleTileSelect} />
        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <TileGrid />
        </main>
      </div>
    </div>
  );
});

/**
 * Main Dashboard component that wraps the dashboard content
 * with error boundaries and context providers.
 *
 * @returns {JSX.Element} The main dashboard component
 */
export const Dashboard = React.memo(() => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
});
