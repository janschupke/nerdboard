import { DashboardProvider } from '../../contexts/DashboardContext';
import { TileGrid } from './TileGrid';
import { Sidebar } from './Sidebar';
import { useDashboard } from '../../hooks/useDashboard';
import { Icon } from '../ui/Icon';
import { TileType } from '../../types/dashboard';
import { ErrorBoundary } from '../ErrorBoundary';
import { useTheme } from '../../contexts/ThemeContext';

function DashboardContent() {
  const { state, addTile, toggleSidebar } = useDashboard();
  const { sidebarOpen } = state;
  const { theme, toggleTheme } = useTheme();

  const handleTileSelect = (tileType: TileType) => {
    addTile(tileType);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-theme-primary transition-all duration-300">
      {/* Header - Full Width */}
      <header className="bg-surface-primary border-b border-theme-primary px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size="md" />
          </button>
          <h1 className="text-xl font-semibold text-theme-primary">Nerdboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
          </button>
          <span className="text-sm text-theme-secondary">{state.tiles.length} tiles</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onTileSelect={handleTileSelect} />

        {/* Tile Grid */}
        <main className="flex-1 overflow-hidden relative transition-all duration-300">
          <div className="h-full overflow-auto">
            <TileGrid />
          </div>
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
