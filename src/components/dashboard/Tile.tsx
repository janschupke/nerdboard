import React from 'react';
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
}

export function Tile({ tile, onRemove, children }: TileProps) {
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
        return (
          <WeatherTile
            size={size}
            config={{ city: 'helsinki', country: 'Finland', refreshInterval: 300000 }}
          />
        );
      case TileType.WEATHER_PRAGUE:
        return (
          <WeatherTile
            size={size}
            config={{ city: 'prague', country: 'Czech Republic', refreshInterval: 300000 }}
          />
        );
      case TileType.WEATHER_TAIPEI:
        return (
          <WeatherTile
            size={size}
            config={{ city: 'taipei', country: 'Taiwan', refreshInterval: 300000 }}
          />
        );
      case TileType.GDX_ETF:
        return <GDXETFTile id={tile.id} size={size} config={config} />;
      case TileType.TIME_HELSINKI:
        return (
          <TimeTile
            id={tile.id}
            size={size}
            config={{ city: 'helsinki', showBusinessHours: true }}
          />
        );
      case TileType.TIME_PRAGUE:
        return (
          <TimeTile id={tile.id} size={size} config={{ city: 'prague', showBusinessHours: true }} />
        );
      case TileType.TIME_TAIPEI:
        return (
          <TimeTile id={tile.id} size={size} config={{ city: 'taipei', showBusinessHours: true }} />
        );
      case TileType.URANIUM:
        return <UraniumTile id={tile.id} size={size} config={config} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-theme-secondary">
            <p>Unknown tile type: {tile.type}</p>
          </div>
        );
    }
  };

  const getTileClasses = () => {
    const baseClasses =
      'bg-surface-primary border border-theme-primary rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-1 row-span-1 md:col-span-2',
      large: 'col-span-1 row-span-1 md:col-span-2 lg:col-span-3',
    };
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    return `${baseClasses} ${sizeClasses[size] || sizeClasses.medium}`;
  };

  const getTileStyles = () => {
    return {
      gridColumn: tile.position ? `span ${tile.position.x + 1}` : undefined,
      gridRow: tile.position ? `span ${tile.position.y + 1}` : undefined,
    };
  };

  const getTileTitle = () => {
    const titles: Record<TileType, string> = {
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
    return titles[tile.type] || 'Unknown Tile';
  };

  const getTileIcon = () => {
    const icons: Record<TileType, string> = {
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
    return icons[tile.type] || 'chart';
  };

  return (
    <div
      className={getTileClasses()}
      style={getTileStyles()}
      data-tile-id={tile.id}
      data-tile-type={tile.type}
      role="gridcell"
      aria-label={`${getTileTitle()} tile`}
    >
      {/* Tile Header */}
      <div className="flex items-center justify-between p-3 border-b border-theme-primary">
        <div className="flex items-center space-x-2">
          <Icon name={getTileIcon()} size="sm" className="text-accent-primary" aria-hidden="true" />
          <h3 className="text-sm font-medium text-theme-primary truncate">{getTileTitle()}</h3>
        </div>
        {/* Close Button */}
        {onRemove && (
          <button
            onClick={() => onRemove(tile.id)}
            className="p-1 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors"
            aria-label={`Remove ${getTileTitle()} tile`}
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
