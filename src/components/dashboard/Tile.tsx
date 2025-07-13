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
import { getTileSpan } from '../../constants/dimensions';

interface TileProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export function Tile({ tile, onRemove, children, dragHandleProps, loading, error, className }: TileProps) {
  const renderTileContent = () => {
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const config = tile.config || {};

    // Show loading state if loading prop is true
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-theme-secondary">
          <div className="flex items-center space-x-2">
            <Icon name="loading" size="sm" className="animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      );
    }

    // Show error state if error prop is provided
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-theme-secondary">
          <div className="text-center">
            <p className="text-sm">Failed to load data</p>
            <p className="text-xs text-theme-tertiary mt-1">{error.message}</p>
          </div>
        </div>
      );
    }

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
      'bg-surface-primary border border-theme-primary rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative';
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const { colSpan, rowSpan } = getTileSpan(size);
    // Tailwind col-span-X and row-span-X classes (for fallback, not used in grid, but for responsive)
    const sizeClass = `col-span-${colSpan} row-span-${rowSpan}`;
    return `${baseClasses} ${sizeClass}`;
  };

  const getTileStyles = () => {
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const { colSpan, rowSpan } = getTileSpan(size);
    // Use position if available, otherwise use span only
    if (tile.position) {
      return {
        gridColumn: `${tile.position.x + 1} / span ${colSpan}`,
        gridRow: `${tile.position.y + 1} / span ${rowSpan}`,
      };
    }
    return { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` };
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
      className={`${getTileClasses()} ${className || ''}`}
      style={getTileStyles()}
      data-tile-id={tile.id}
      data-tile-type={tile.type}
      role="gridcell"
      aria-label={`${getTileTitle()} tile`}
    >
      {/* Tile Header - Grabbable */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b border-theme-primary bg-surface-secondary cursor-grab active:cursor-grabbing relative min-h-[2.5rem]"
        style={{ minHeight: '2.5rem' }}
        {...dragHandleProps}
      >
        <div className="flex items-center space-x-3">
          <Icon name={getTileIcon()} size="sm" className="text-accent-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-theme-primary truncate">{getTileTitle()}</h3>
        </div>
      </div>

      {/* Close Button - Positioned in top right corner */}
      {onRemove && (
        <button
          onClick={() => onRemove(tile.id)}
          className="absolute top-1 right-1 p-1 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors cursor-pointer z-10"
          aria-label={`Remove ${getTileTitle()} tile`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Icon name="close" size="sm" />
        </button>
      )}

      {/* Tile Content */}
      <div className="flex-1 p-2" role="region" aria-label={`${getTileTitle()} content`}>
        {children || renderTileContent()}
      </div>
    </div>
  );
}
