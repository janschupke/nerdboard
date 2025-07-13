import type { DashboardTile } from '../../types/dashboard';
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
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const config = tile.config || {};
    
    switch (tile.type) {
      case 'cryptocurrency':
        return <CryptocurrencyTile id={tile.id} size={size} config={config} />;
      case 'precious_metals':
        return <PreciousMetalsTile id={tile.id} size={size} config={config} />;
      case 'federal_funds_rate':
        return <FederalFundsRateTile id={tile.id} size={size} config={config} />;
      case 'euribor_rate':
        return <EuriborRateTile />;
      case 'weather_helsinki':
        return <WeatherTile size={size} config={{ city: 'helsinki', country: 'Finland', refreshInterval: 300000 }} />;
      case 'weather_prague':
        return <WeatherTile size={size} config={{ city: 'prague', country: 'Czech Republic', refreshInterval: 300000 }} />;
      case 'weather_taipei':
        return <WeatherTile size={size} config={{ city: 'taipei', country: 'Taiwan', refreshInterval: 300000 }} />;
      case 'gdx_etf':
        return <GDXETFTile id={tile.id} size={size} config={config} />;
      case 'time_helsinki':
        return <TimeTile id={tile.id} size={size} config={{ city: 'helsinki', showBusinessHours: true }} />;
      case 'time_prague':
        return <TimeTile id={tile.id} size={size} config={{ city: 'prague', showBusinessHours: true }} />;
      case 'time_taipei':
        return <TimeTile id={tile.id} size={size} config={{ city: 'taipei', showBusinessHours: true }} />;
      case 'uranium':
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
      cryptocurrency: 'Cryptocurrency',
      precious_metals: 'Precious Metals',
      federal_funds_rate: 'Federal Funds Rate',
      euribor_rate: 'Euribor Rate',
      weather_helsinki: 'Helsinki Weather',
      weather_prague: 'Prague Weather',
      weather_taipei: 'Taipei Weather',
      gdx_etf: 'GDX ETF',
      time_helsinki: 'Helsinki Time',
      time_prague: 'Prague Time',
      time_taipei: 'Taipei Time',
      uranium: 'Uranium Price',
    };
    return titles[tile.type as keyof typeof titles] || 'Tile';
  };

  const getTileIcon = () => {
    const icons = {
      cryptocurrency: 'crypto',
      precious_metals: 'metals',
      federal_funds_rate: 'chart',
      euribor_rate: 'chart',
      weather_helsinki: 'weather',
      weather_prague: 'weather',
      weather_taipei: 'weather',
      gdx_etf: 'chart',
      time_helsinki: 'clock',
      time_prague: 'clock',
      time_taipei: 'clock',
      uranium: 'chart',
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
