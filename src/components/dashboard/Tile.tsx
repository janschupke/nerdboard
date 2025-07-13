import type { DashboardTile } from '../../types/dashboard';
import { TileType, TileSize } from '../../types/dashboard';
import { Icon } from '../ui/Icon';
import { CryptocurrencyTile } from './tiles/cryptocurrency/CryptocurrencyTile';
import { PreciousMetalsTile } from './tiles/precious-metals/PreciousMetalsTile';
import { FederalFundsRateTile } from './tiles/federal-funds-rate/FederalFundsRateTile';
import { EuriborRateTile } from './tiles/euribor-rate/EuriborRateTile';
import { WeatherTile } from './tiles/weather/WeatherTile';
import { GDXETFTile } from './tiles/gdx-etf/GDXETFTile';
import { TimeTile } from './tiles/time/TimeTile';
import { UraniumTile } from './tiles/uranium/UraniumTile';

interface TileProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function Tile({ tile, onRemove, children, dragHandleProps }: TileProps) {
  const renderTileContent = () => {
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const config = tile.config || {};
    
    switch (tile.type) {
      case TileType.CRYPTOCURRENCY:
        return <CryptocurrencyTile id={tile.id} size={size} config={config} />;
      case TileType.PRECIOUS_METALS:
        return <PreciousMetalsTile id={tile.id} size={size} config={config} />;
      case TileType.FEDERAL_FUNDS_RATE:
        return <FederalFundsRateTile id={tile.id} size={size} config={config} />;
      case TileType.EURIBOR_RATE:
        return <EuriborRateTile />;
      case TileType.WEATHER_HELSINKI:
        return <WeatherTile size={size} config={{ city: 'helsinki', country: 'Finland', refreshInterval: 300000 }} />;
      case TileType.WEATHER_PRAGUE:
        return <WeatherTile size={size} config={{ city: 'prague', country: 'Czech Republic', refreshInterval: 300000 }} />;
      case TileType.WEATHER_TAIPEI:
        return <WeatherTile size={size} config={{ city: 'taipei', country: 'Taiwan', refreshInterval: 300000 }} />;
      case TileType.GDX_ETF:
        return <GDXETFTile id={tile.id} size={size} config={config} />;
      case TileType.TIME_HELSINKI:
        return <TimeTile id={tile.id} size={size} config={{ city: 'helsinki', showBusinessHours: true }} />;
      case TileType.TIME_PRAGUE:
        return <TimeTile id={tile.id} size={size} config={{ city: 'prague', showBusinessHours: true }} />;
      case TileType.TIME_TAIPEI:
        return <TimeTile id={tile.id} size={size} config={{ city: 'taipei', showBusinessHours: true }} />;
      case TileType.URANIUM:
        return <UraniumTile id={tile.id} size={size} config={config} />;
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
      [TileType.CRYPTOCURRENCY]: 'Cryptocurrency',
      [TileType.PRECIOUS_METALS]: 'Precious Metals',
      [TileType.FEDERAL_FUNDS_RATE]: 'Federal Funds Rate',
      [TileType.EURIBOR_RATE]: 'Euribor Rate',
      [TileType.WEATHER_HELSINKI]: 'Helsinki Weather',
      [TileType.WEATHER_PRAGUE]: 'Prague Weather',
      [TileType.WEATHER_TAIPEI]: 'Taipei Weather',
      [TileType.GDX_ETF]: 'GDX ETF',
      [TileType.TIME_HELSINKI]: 'Helsinki Time',
      [TileType.TIME_PRAGUE]: 'Prague Time',
      [TileType.TIME_TAIPEI]: 'Taipei Time',
      [TileType.URANIUM]: 'Uranium Price',
    };
    return titles[tile.type] || 'Tile';
  };

  const getTileIcon = () => {
    const icons = {
      [TileType.CRYPTOCURRENCY]: 'crypto',
      [TileType.PRECIOUS_METALS]: 'metals',
      [TileType.FEDERAL_FUNDS_RATE]: 'chart',
      [TileType.EURIBOR_RATE]: 'chart',
      [TileType.WEATHER_HELSINKI]: 'weather',
      [TileType.WEATHER_PRAGUE]: 'weather',
      [TileType.WEATHER_TAIPEI]: 'weather',
      [TileType.GDX_ETF]: 'chart',
      [TileType.TIME_HELSINKI]: 'clock',
      [TileType.TIME_PRAGUE]: 'clock',
      [TileType.TIME_TAIPEI]: 'clock',
      [TileType.URANIUM]: 'chart',
    };
    return icons[tile.type] || 'settings';
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
