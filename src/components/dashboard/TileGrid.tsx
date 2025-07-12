
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to Nerdboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add tiles from the sidebar to get started
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
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
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 auto-rows-min relative ${isDragOver ? 'ring-4 ring-primary-300 dark:ring-primary-400' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {tiles.map((tile, idx) => (
        <DraggableTile
          key={tile.id}
          tile={tile}
          index={idx}
          onMove={handleTileMove}
        >
          <Tile
            tile={tile}
            onRemove={removeTile}
          />
        </DraggableTile>
      ))}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 opacity-30 pointer-events-none z-10 rounded-lg" />
      )}
    </div>
  );
} 
