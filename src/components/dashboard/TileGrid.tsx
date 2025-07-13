import React, { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { Tile } from './Tile';
import { TileDataProvider } from '../../contexts/TileDataContext';

export const TileGrid = React.memo(() => {
  const dashboardContext = useDashboard();
  const { state, removeTile } = dashboardContext;
  const { tiles } = state;

  // Memoize rendered tiles to prevent unnecessary re-renders
  const renderedTiles = useMemo(() => {
    return tiles.map((tile) => (
      <Tile
        key={tile.id}
        tile={tile}
        onRemove={removeTile}
      />
    ));
  }, [tiles, removeTile]);

  if (tiles.length === 0) {
    return (
      <div className="relative h-full" aria-label="Dashboard grid">
        {/* Welcome Message */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Dashboard icon">
              📊
            </div>
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Welcome to Dashboard</h2>
            <p className="text-theme-secondary mb-4">Add tiles from the sidebar to get started</p>
            <div className="text-sm text-theme-tertiary">
              Click the menu button to open the sidebar
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TileDataProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {renderedTiles}
      </div>
    </TileDataProvider>
  );
});
