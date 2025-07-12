
import { useDashboard } from '../../hooks/useDashboard';
import { Tile } from './Tile';
import { DraggableTile } from './DraggableTile';

export function TileGrid() {
  const { state, removeTile } = useDashboard();
  const { tiles } = state;

  if (tiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Welcome to Nerdboard
          </h2>
          <p className="text-gray-500 mb-4">
            Add tiles from the sidebar to get started
          </p>
          <div className="text-sm text-gray-400">
            Click the menu button to open the sidebar
          </div>
        </div>
      </div>
    );
  }

  const handleTileMove = (tileId: string, newPosition: { x: number; y: number }) => {
    // TODO: Implement tile movement logic
    console.log('Tile moved:', tileId, newPosition);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 auto-rows-min">
      {tiles.map((tile) => (
        <DraggableTile
          key={tile.id}
          tile={tile}
          onMove={handleTileMove}
        >
          <Tile
            tile={tile}
            onRemove={removeTile}
          />
        </DraggableTile>
      ))}
    </div>
  );
} 
