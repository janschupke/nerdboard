import React from 'react';
import type { DashboardTile } from '../../../types/dashboard';
import { TileType, TileSize } from '../../../types/dashboard';
import { Icon } from '../../ui/Icon';
import { useDashboard } from '../../../hooks/useDashboard';
import { useCallback } from 'react';
import { getTileSpan } from '../../../constants/gridSystem';

interface GenericTileProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  className?: string;
}

export function GenericTile({
  tile,
  onRemove,
  children,
  dragHandleProps,
  className,
}: GenericTileProps) {
  const { removeTile } = useDashboard();

  const handleRemove = useCallback(async () => {
    try {
      onRemove?.(tile.id);
      await removeTile(tile.id);
    } catch {
      // Optionally show a toast or error message
    }
  }, [tile.id, removeTile, onRemove]);

  const getTileClasses = () => {
    const baseClasses =
      'bg-surface-primary border border-theme-primary rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative';
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const { colSpan, rowSpan } = getTileSpan(size);
    const sizeClass = `col-span-${colSpan} row-span-${rowSpan}`;
    return `${baseClasses} ${sizeClass}`;
  };

  const getTileStyles = () => {
    const size = typeof tile.size === 'string' ? tile.size : TileSize.MEDIUM;
    const { colSpan, rowSpan } = getTileSpan(size);
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
          onClick={handleRemove}
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
        {(() => {
          try {
            return children;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            return (
              <div className="mt-2 text-error-600 text-sm">
                <span className="font-semibold">Tile Error:</span> {errorMsg}
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
} 
