import React, { useCallback, forwardRef, useMemo } from 'react';
import type { DragboardTileData, DraggableTileProps } from '../dragboard';
import { Icon } from '../ui/Icon';
import { TileErrorBoundary } from './TileErrorBoundary';
import type { RequestStatus } from '../../services/dataFetcher';

export interface TileMeta {
  title: string;
  icon: string;
  category?: import('../../types/tileCategories').TileCategory;
}

export interface GenericTileProps extends DraggableTileProps {
  tile: DragboardTileData;
  meta: TileMeta;
  children?: React.ReactNode;
  status?: RequestStatus;
  lastUpdate?: string;
  style?: React.CSSProperties;
}

const StatusBar = ({ status, lastUpdate }: {
  status?: RequestStatus;
  lastUpdate?: string;
}) => {
  // Determine status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return { name: 'loading', className: 'text-theme-status-info animate-spin' };
      case 'stale':
        return { name: 'warning', className: 'text-theme-status-warning' };
      case 'error':
        return { name: 'close', className: 'text-theme-status-error' };
      case 'success':
        return { name: 'check', className: 'text-theme-status-success' };
      default:
        return { name: 'close', className: 'text-theme-status-error' };
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs border-t border-theme-border-primary bg-theme-surface-secondary">
      <span className="text-theme-text-secondary">
        {formatLastUpdate(lastUpdate)}
      </span>
      <Icon name={statusIcon.name} size="sm" className={statusIcon.className} />
    </div>
  );
};

export const GenericTile = React.memo(
  forwardRef<HTMLDivElement, GenericTileProps>(
    ({ tile, meta, onRemove, dragHandleProps, className, style, children, status, lastUpdate }, ref) => {
      const handleRemove = useCallback(async () => {
        try {
          onRemove?.(tile.id);
        } catch {
          // Optionally show a toast or error message
        }
      }, [tile.id, onRemove]);

      const getTileClasses = () => {
        const baseClasses =
          'rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative border border-theme-border-primary';
        return `${baseClasses} ${className || ''}`;
      };

      // Memoize the header props to prevent re-renders
      const headerProps = useMemo(
        () => ({
          className:
            'flex items-center justify-between px-4 py-2 border-b border-theme-border-primary bg-theme-surface-secondary cursor-grab active:cursor-grabbing relative min-h-[2.5rem]',
          style: { minHeight: '2.5rem' },
          ...dragHandleProps,
        }),
        [dragHandleProps],
      );

      return (
        <TileErrorBoundary>
          <div
            ref={ref}
            className={getTileClasses()}
            style={style}
            data-tile-id={tile.id}
            data-tile-type={tile.type}
            role="gridcell"
            aria-label={`${meta.title} tile`}
          >
            {/* Tile Header - Grabbable */}
            <div {...headerProps}>
              <div className="flex items-center space-x-3">
                <Icon
                  name={meta.icon}
                  size="sm"
                  className="text-theme-accent-primary"
                  aria-hidden="true"
                />
                <h3 className="text-base font-semibold text-theme-text-primary truncate">
                  {meta.title}
                </h3>
              </div>
            </div>

            {/* Close Button - Positioned in top right corner */}
            {onRemove && (
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-text-tertiary rounded transition-colors cursor-pointer z-10"
                aria-label={`Remove ${meta.title} tile`}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Icon name="close" size="sm" />
              </button>
            )}

            {/* Tile Content */}
            <div className="flex-1 p-2" role="region" aria-label={`${meta.title} content`}>
              {children}
            </div>

            {/* Status Bar */}
            <StatusBar status={status} lastUpdate={lastUpdate} />
          </div>
        </TileErrorBoundary>
      );
    },
  ),
  (prev, next) => prev.tile.id === next.tile.id,
);

GenericTile.displayName = 'GenericTile';
