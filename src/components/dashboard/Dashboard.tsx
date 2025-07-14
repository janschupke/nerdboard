import { DashboardProvider } from '../../contexts/DashboardContext';
import { TileGrid } from './TileGrid';
import { Sidebar } from './Sidebar';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Icon } from '../ui/Icon';
import { ErrorBoundary } from '../ErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import { useContext } from 'react';
import { LogButton } from './LogButton';
import { useLogManager } from '../../hooks/useLogManager';
import React, { Suspense } from 'react';

/**
 * Main dashboard content component that renders the dashboard layout
 * with sidebar, header, and tile grid
 *
 * @returns {JSX.Element} The dashboard content component
 */
function DashboardContent() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('DashboardContent must be used within DashboardProvider');
  }

  const { state, toggleCollapse, refreshAllTiles, isRefreshing } = dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  const LogView = React.lazy(() => import('./LogView').then(m => ({ default: m.LogView })));

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
          <TileGrid />
          <Suspense fallback={null}>
            <LogView isOpen={isLogViewOpen} onClose={closeLogView} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/**
 * Main Dashboard component that wraps the dashboard content
 * with the necessary providers and error boundaries
 *
 * @returns {JSX.Element} The main dashboard component
 */
export function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ErrorBoundary>
  );
}
