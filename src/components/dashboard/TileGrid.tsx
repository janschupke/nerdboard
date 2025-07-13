import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { useState, useContext } from 'react';

export function TileGrid() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('TileGrid must be used within DashboardProvider');
  }
  
  const { layout, removeTile, addTile } = dashboardContext;
  const { tiles } = layout;
  const [isDragOver, setIsDragOver] = useState(false);

  if (tiles.length === 0) {
    return (
      <div className="relative h-full" aria-label="Dashboard grid">
        {/* Welcome Message */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Dashboard icon">
              📊
            </div>
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Welcome to Nerdboard</h2>
            <p className="text-theme-secondary mb-4">Add tiles from the sidebar to get started</p>
            <div className="text-sm text-theme-tertiary">
              Click the menu button to open the sidebar
            </div>
          </div>
        </div>
        
        {/* Full-size drag target overlay */}
        <div
          className="absolute inset-0 z-10"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
              e.preventDefault();
              setIsDragOver(true);
            }
          }}
          onDrop={(e) => {
            setIsDragOver(false);
            const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
            if (tileType) {
              addTile(tileType as import('../../types/dashboard').TileType);
            }
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-accent-muted opacity-30 pointer-events-none z-10 rounded-lg ring-4 ring-accent-primary" />
          )}
        </div>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
    if (tileType) {
      addTile(tileType as import('../../types/dashboard').TileType);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      className={`h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 auto-rows-min relative ${isDragOver ? 'ring-4 ring-accent-primary' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      role="grid"
      aria-label="Dashboard tiles grid"
      aria-describedby={tiles.length > 0 ? 'tiles-description' : undefined}
    >
      {tiles.length > 0 && (
        <div id="tiles-description" className="sr-only">
          Dashboard grid containing {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </div>
      )}
      {tiles.map((tile) => (
        <Tile key={tile.id} tile={tile} onRemove={removeTile} />
      ))}
      {isDragOver && (
        <div
          className="absolute inset-0 bg-accent-muted opacity-30 pointer-events-none z-10 rounded-lg"
          aria-hidden="true"
          role="presentation"
        />
      )}
    </div>
  );
}
