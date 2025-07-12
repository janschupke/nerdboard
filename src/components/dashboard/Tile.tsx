
import type { TileConfig } from '../../types/dashboard';
import { Icon } from '../ui/Icon';
import { CryptocurrencyTile } from './tiles/cryptocurrency/CryptocurrencyTile';
import { PreciousMetalsTile } from './tiles/precious-metals/PreciousMetalsTile';

interface TileProps {
  tile: TileConfig;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function Tile({ tile, onRemove, children, dragHandleProps }: TileProps) {
  const renderTileContent = () => {
    switch (tile.type) {
      case 'cryptocurrency':
        return <CryptocurrencyTile id={tile.id} size={tile.size} config={tile.config} />;
      case 'precious_metals':
        return <PreciousMetalsTile id={tile.id} size={tile.size} config={tile.config} />;
      default:
        return (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Icon name="loading" size="lg" className="animate-spin mb-2" />
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        );
    }
  };

  const getTileClasses = () => {
    const baseClasses = 'relative bg-surface-primary rounded-lg shadow-md border border-theme-primary overflow-hidden';
    return baseClasses;
  };

  const getTileStyles = () => {
    const sizeStyles = {
      small: { gridColumn: 'span 1', gridRow: 'span 1' },
      medium: { gridColumn: 'span 1', gridRow: 'span 1' },
      large: { gridColumn: 'span 2', gridRow: 'span 2' },
    };
    return sizeStyles[tile.size];
  };

  const getTileTitle = () => {
    const titles = {
      cryptocurrency: 'Cryptocurrency',
      precious_metals: 'Precious Metals',
    };
    return titles[tile.type] || 'Tile';
  };

  const getTileIcon = () => {
    const icons = {
      cryptocurrency: 'crypto',
      precious_metals: 'metals',
    };
    return icons[tile.type] || 'settings';
  };

  return (
    <div
      className={getTileClasses()}
      style={getTileStyles()}
      data-tile-id={tile.id}
      data-tile-type={tile.type}
    >
      {/* Tile Header */}
      <div className="flex items-center justify-between p-3 border-b border-theme-primary bg-surface-secondary">
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center w-6 h-6 mr-2 cursor-grab text-theme-secondary hover:text-theme-primary"
          aria-label="Drag tile"
          {...dragHandleProps}
        >
          <Icon name="drag" size="sm" />
        </div>
        {/* Title and Icon */}
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          <Icon name={getTileIcon()} size="sm" className="text-accent-primary" />
          <h3 className="text-sm font-medium text-theme-primary truncate">{getTileTitle()}</h3>
        </div>
        {/* Close Button */}
        {onRemove && (
          <button
            onClick={() => onRemove(tile.id)}
            className="p-1 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors ml-2"
            aria-label={`Remove ${getTileTitle()} tile`}
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {/* Tile Content */}
      <div className="flex-1 p-4">
        {children || renderTileContent()}
      </div>
    </div>
  );
} 
