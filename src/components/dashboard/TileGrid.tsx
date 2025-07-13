import { useDashboard } from '../../hooks/useDashboard';
import { Tile } from './Tile';
import { DraggableTile } from './DraggableTile';
import { useState } from 'react';

export function TileGrid() {
  const { state, removeTile, addTile, moveTile } = useDashboard();
  const { tiles } = state;
  const [isDragOver, setIsDragOver] = useState(false);

  if (tiles.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-full"
        aria-label="Dashboard grid"
      >
        <div className="text-center">
          <div className="text-6xl mb-4" role="img" aria-label="Dashboard icon">📊</div>
          <h2 className="text-xl font-semibold text-theme-primary mb-2">Welcome to Nerdboard</h2>
          <p className="text-theme-secondary mb-4">Add tiles from the sidebar to get started</p>
          <div className="text-sm text-theme-tertiary">
            Click the menu button to open the sidebar
          </div>
        </div>
      </div>
    );
  }

  const handleTileMove = (from: number, to: number) => {
    moveTile(from, to);
  };

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
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 auto-rows-min relative ${isDragOver ? 'ring-4 ring-accent-primary' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      role="grid"
      aria-label="Dashboard tiles grid"
      aria-describedby={tiles.length > 0 ? "tiles-description" : undefined}
    >
      {tiles.length > 0 && (
        <div id="tiles-description" className="sr-only">
          Dashboard grid containing {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </div>
      )}
      {tiles.map((tile, idx) => (
        <DraggableTile key={tile.id} tile={tile} index={idx} onMove={handleTileMove}>
          <Tile tile={tile} onRemove={removeTile} />
        </DraggableTile>
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
