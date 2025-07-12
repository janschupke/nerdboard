
import { DashboardProvider } from '../../contexts/DashboardContext';
import { TileGrid } from './TileGrid';
import { Sidebar } from './Sidebar';
import { useDashboard } from '../../hooks/useDashboard';
import { Icon } from '../ui/Icon';
import { TileType } from '../../types/dashboard';
import { ErrorBoundary } from '../ErrorBoundary';

function DashboardContent() {
  const { state, addTile, toggleSidebar } = useDashboard();
  const { sidebarOpen } = state;

  const handleTileSelect = (tileType: TileType) => {
    addTile(tileType);
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onTileSelect={handleTileSelect}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Icon name="menu" size="md" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Nerdboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {state.tiles.length} tiles
            </span>
          </div>
        </header>

        {/* Tile Grid */}
        <div className="flex-1 overflow-auto">
          <TileGrid />
        </div>
      </main>
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
