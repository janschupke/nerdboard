import React, { useState, useContext } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { TileType } from '../../types/dashboard';

export function TileGrid() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('TileGrid must be used within DashboardProvider');
  }

  const { state, removeTile, addTile } = dashboardContext;
  const { tiles = [] } = state?.layout || {};
  const [isDragOver, setIsDragOver] = useState(false);

  if (tiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-theme-tertiary rounded-lg flex items-center justify-center">
              <span className="text-2xl text-theme-secondary">📊</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-theme-primary mb-2">No tiles yet</h3>
          <p className="text-theme-secondary mb-4">
            Add tiles from the sidebar to start building your dashboard
          </p>
          <div className="text-sm text-theme-tertiary">
            <p>Drag tiles from the sidebar or click to add them</p>
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
              addTile(tileType as TileType);
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
      addTile(tileType as TileType);
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
