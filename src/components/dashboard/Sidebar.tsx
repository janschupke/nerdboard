
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
    <aside
      role="complementary"
      className={`h-screen bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out w-64 flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-64'}
      `}
      style={{ minWidth: isOpen ? 256 : 0, width: isOpen ? 256 : 0, overflow: 'hidden' }}
    >
      <div className="flex flex-col h-full w-64">
        {/* Tile Catalog */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {availableTiles.map((tile) => (
              <div
                key={tile.type}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
                onClick={() => onTileSelect(tile.type)}
                role="button"
                tabIndex={0}
                data-tile-type={tile.type}
                draggable={true}
                onDragStart={e => {
                  e.dataTransfer.setData('application/nerdboard-tile-type', tile.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTileSelect(tile.type);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Icon name={tile.icon} size="md" className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {tile.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tile.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon name="add" size="sm" className="text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
    </aside>
  );
} 
