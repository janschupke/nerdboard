
import { TileType } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onTileSelect: (tileType: TileType) => void;
}

export function Sidebar({ isOpen, onToggle, onTileSelect }: SidebarProps) {
  const availableTiles = [
    {
      type: TileType.CRYPTOCURRENCY,
      name: 'Cryptocurrency',
      description: 'Real-time cryptocurrency market data',
      icon: 'crypto',
    },
    {
      type: TileType.PRECIOUS_METALS,
      name: 'Precious Metals',
      description: 'Gold and silver price data',
      icon: 'metals',
    },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full w-64">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Add Tiles</h2>
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Tile Catalog */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {availableTiles.map((tile) => (
              <div
                key={tile.type}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                onClick={() => onTileSelect(tile.type)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTileSelect(tile.type);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Icon name={tile.icon} size="md" className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {tile.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {tile.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon name="add" size="sm" className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={onToggle}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 
