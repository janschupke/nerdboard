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
    {
      type: TileType.FEDERAL_FUNDS_RATE,
      name: 'Federal Funds Rate',
      description: 'Federal Reserve interest rate monitoring',
      icon: 'chart',
    },
    {
      type: TileType.EURIBOR_RATE,
      name: 'Euribor Rate',
      description: 'European interbank lending rate monitoring',
      icon: 'chart',
    },
    {
      type: TileType.WEATHER_HELSINKI,
      name: 'Helsinki Weather',
      description: 'Current weather conditions in Helsinki, Finland',
      icon: 'weather',
    },
    {
      type: TileType.WEATHER_PRAGUE,
      name: 'Prague Weather',
      description: 'Current weather conditions in Prague, Czech Republic',
      icon: 'weather',
    },
    {
      type: TileType.WEATHER_TAIPEI,
      name: 'Taipei Weather',
      description: 'Current weather conditions in Taipei, Taiwan',
      icon: 'weather',
    },
    {
      type: TileType.GDX_ETF,
      name: 'GDX ETF',
      description: 'VanEck Vectors Gold Miners ETF tracking',
      icon: 'chart',
    },
    {
      type: TileType.TIME_HELSINKI,
      name: 'Helsinki Time',
      description: 'Current time and timezone for Helsinki, Finland',
      icon: 'clock',
    },
    {
      type: TileType.TIME_PRAGUE,
      name: 'Prague Time',
      description: 'Current time and timezone for Prague, Czech Republic',
      icon: 'clock',
    },
    {
      type: TileType.TIME_TAIPEI,
      name: 'Taipei Time',
      description: 'Current time and timezone for Taipei, Taiwan',
      icon: 'clock',
    },
    {
      type: TileType.URANIUM,
      name: 'Uranium Price',
      description: 'Real-time uranium price tracking and market data',
      icon: 'chart',
    },
  ];

  return (
    <aside
      role="complementary"
      aria-label="Tile catalog sidebar"
      className={`h-full bg-surface-primary shadow-lg border-r border-theme-primary transition-all duration-300 ease-in-out w-64 flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-64'}
      `}
      style={{ minWidth: isOpen ? 256 : 0, width: isOpen ? 256 : 0, overflow: 'hidden' }}
    >
      <div className="flex flex-col h-full w-64">
        {/* Tile Catalog */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-theme-primary mb-4" id="tiles-heading">
            Available Tiles
          </h2>
          <div
            className="space-y-3"
            role="listbox"
            aria-labelledby="tiles-heading"
            aria-label="Available dashboard tiles"
          >
            {availableTiles.map((tile) => (
              <div
                key={tile.type}
                className="p-4 border border-theme-primary rounded-lg hover:border-accent-primary hover:bg-accent-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                onClick={() => onTileSelect(tile.type)}
                role="button"
                aria-selected="false"
                tabIndex={0}
                data-tile-type={tile.type}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/nerdboard-tile-type', tile.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTileSelect(tile.type);
                  }
                }}
                aria-label={`Add ${tile.name} tile to dashboard`}
                title={`Add ${tile.name} tile to dashboard`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Icon
                      name={tile.icon}
                      size="md"
                      className="text-accent-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-theme-primary truncate">{tile.name}</h3>
                    <p className="text-xs text-theme-secondary mt-1">{tile.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon name="add" size="sm" className="text-theme-tertiary" aria-hidden="true" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-primary">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            Close
          </Button>
        </div>
      </div>
    </aside>
  );
}
