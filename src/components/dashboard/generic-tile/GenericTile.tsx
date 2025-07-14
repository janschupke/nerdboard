import React from 'react';
import type { DashboardTile } from '../../../types/dashboard';
import { getTileSpan } from '../../../constants/dashboardGrid';
import { Icon } from '../../ui/Icon';
import { useDashboard } from '../../../hooks/useDashboard';
import { useCallback } from 'react';

export interface TileMeta {
  title: string;
  icon: string;
}

interface GenericTileProps {
  tile: DashboardTile;
  meta: TileMeta;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  className?: string;
}

export function GenericTile({
  tile,
  meta,
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
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan, rowSpan } = getTileSpan(size);
    const sizeClass = `col-span-${colSpan} row-span-${rowSpan}`;
    return `${baseClasses} ${sizeClass}`;
  };

  const getTileStyles = () => {
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan, rowSpan } = getTileSpan(size);
    if (tile.position) {
      return {
        gridColumn: `${tile.position.x + 1} / span ${colSpan}`,
        gridRow: `${tile.position.y + 1} / span ${rowSpan}`,
      };
    }
    return { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` };
  };

  return (
    <div
      className={`${getTileClasses()} ${className || ''}`}
      style={getTileStyles()}
      data-tile-id={tile.id}
      data-tile-type={tile.type}
      role="gridcell"
      aria-label={`${meta.title} tile`}
    >
      {/* Tile Header - Grabbable */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-theme-primary bg-surface-secondary cursor-grab active:cursor-grabbing relative min-h-[2.5rem]"
        style={{ minHeight: '2.5rem' }}
        {...dragHandleProps}
      >
        <div className="flex items-center space-x-3">
          <Icon name={meta.icon} size="sm" className="text-accent-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-theme-primary truncate">{meta.title}</h3>
        </div>
      </div>

      {/* Close Button - Positioned in top right corner */}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-1 right-1 p-1 text-theme-tertiary hover:text-theme-primary hover:bg-theme-tertiary rounded transition-colors cursor-pointer z-10"
          aria-label={`Remove ${meta.title} tile`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Icon name="close" size="sm" />
        </button>
      )}

      {/* Tile Content */}
      <div className="flex-1 p-2" role="region" aria-label={`${meta.title} content`}>
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
