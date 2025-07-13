import type { DashboardTile } from '../../types/dashboard';
import { Icon } from '../ui/Icon';
import { CryptocurrencyTile } from './tiles/cryptocurrency/CryptocurrencyTile';
import { PreciousMetalsTile } from './tiles/precious-metals/PreciousMetalsTile';

interface TileProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function Tile({ tile, onRemove, children, dragHandleProps }: TileProps) {
  const renderTileContent = () => {
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const config = tile.config || {};
    
    switch (tile.type) {
      case 'cryptocurrency':
        return <CryptocurrencyTile id={tile.id} size={size} config={config} />;
      case 'precious_metals':
        return <PreciousMetalsTile id={tile.id} size={size} config={config} />;
      default:
        return (
          <div className="flex items-center justify-center h-32 text-theme-muted">
            <div className="text-center">
              <Icon name="loading" size="lg" className="animate-spin mb-2" />
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        );
    }
  };

  const getTileClasses = () => {
    const baseClasses =
      'relative bg-surface-primary rounded-lg shadow-md border border-theme-primary overflow-hidden focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2';
    return baseClasses;
  };

  const getTileStyles = () => {
    const sizeStyles = {
      small: { gridColumn: 'span 1', gridRow: 'span 1' },
      medium: { gridColumn: 'span 1', gridRow: 'span 1' },
      large: { gridColumn: 'span 2', gridRow: 'span 2' },
    };
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    return sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.medium;
  };

  const getTileTitle = () => {
    const titles = {
      cryptocurrency: 'Cryptocurrency',
      precious_metals: 'Precious Metals',
    };
    return titles[tile.type as keyof typeof titles] || 'Tile';
  };

  const getTileIcon = () => {
    const icons = {
      cryptocurrency: 'crypto',
      precious_metals: 'metals',
    };
    return icons[tile.type as keyof typeof icons] || 'settings';
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRemove?.(tile.id);
    }
  };

  return (
    <div
      className={getTileClasses()}
      style={getTileStyles()}
      data-tile-id={tile.id}
      data-tile-type={tile.type}
      role="article"
      aria-label={`${getTileTitle()} tile`}
      tabIndex={0}
    >
      {/* Tile Header */}
      <div className="flex items-center justify-between p-3 border-b border-theme-primary bg-surface-secondary">
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center w-6 h-6 mr-2 cursor-grab text-theme-secondary hover:text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 rounded"
          aria-label={`Drag ${getTileTitle()} tile`}
          tabIndex={0}
          {...dragHandleProps}
        >
          <Icon name="drag" size="sm" />
        </div>
        {/* Title and Icon */}
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          <Icon name={getTileIcon()} size="sm" className="text-accent-primary" aria-hidden="true" />
          <h3 className="text-sm font-medium text-theme-primary truncate">{getTileTitle()}</h3>
        </div>
        {/* Close Button */}
        {onRemove && (
          <button
            onClick={() => onRemove(tile.id)}
            onKeyDown={handleRemoveKeyDown}
            className="p-1 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1"
            aria-label={`Remove ${getTileTitle()} tile`}
            title={`Remove ${getTileTitle()} tile`}
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {/* Tile Content */}
      <div className="flex-1 p-4" role="region" aria-label={`${getTileTitle()} content`}>
        {children || renderTileContent()}
      </div>
    </div>
  );
}
