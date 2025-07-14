import React, { useCallback, forwardRef } from 'react';
import type { DashboardTile } from '../dragboard/dashboard';
import type { DraggableTileProps } from '../dragboard/DragboardTile';
import { Icon } from '../ui/Icon';

export interface TileMeta {
  title: string;
  icon: string;
}

export interface GenericTileStatus {
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

export interface GenericTileDataHook<T = unknown> {
  (tileId: string): GenericTileStatus & { data?: T };
}

export interface GenericTileProps<T = unknown> extends DraggableTileProps {
  tile: DashboardTile;
  meta: TileMeta;
  useTileData: GenericTileDataHook<T>;
  renderContent?: (status: GenericTileStatus, data?: T) => React.ReactNode;
}

export const GenericTile = forwardRef<HTMLDivElement, GenericTileProps<unknown>>(
  ({ tile, meta, onRemove, dragHandleProps, className, style, useTileData, renderContent }, ref) => {
    // Call the data hook at the top level
    const tileData = useTileData(tile.id);
    const status: GenericTileStatus = {
      loading: tileData.loading,
      error: tileData.error,
      hasData: tileData.hasData,
    };
    const data = tileData.data;

    const handleRemove = useCallback(async () => {
      try {
        onRemove?.(tile.id);
      } catch {
        // Optionally show a toast or error message
      }
    }, [tile.id, onRemove]);

    // Determine border color based on status
    const getBorderClass = () => {
      if (status.loading) return 'border-2 border-theme-status-info';
      if (status.error && !status.hasData) return 'border-2 border-theme-status-error';
      if (status.error && status.hasData) return 'border-2 border-theme-status-warning';
      return 'border border-theme-border-primary';
    };

    const getTileClasses = () => {
      const baseClasses = 'rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative';
      const borderClass = getBorderClass();
      return `${baseClasses} ${borderClass} ${className || ''}`;
    };

    // Render content based on status
    const renderStatusContent = () => {
      if (renderContent) return renderContent(status, data);
      if (status.loading) {
        return <div className="flex flex-col items-center justify-center h-full space-y-2"><Icon name="loading" size="lg" className="text-theme-status-info" /></div>;
      }
      if (status.error && !status.hasData) {
        return <div className="flex flex-col items-center justify-center h-full space-y-2"><Icon name="close" size="lg" className="text-theme-status-error" /><p className="text-theme-status-error text-sm text-center">Data failed to fetch</p></div>;
      }
      if (status.error && status.hasData) {
        return <div className="flex flex-col items-center justify-center h-full space-y-2"><Icon name="warning" size="lg" className="text-theme-status-warning" /><p className="text-theme-status-warning text-sm text-center">Data may be outdated</p></div>;
      }
      if (status.hasData) {
        return <div className="flex flex-col items-center justify-center h-full space-y-2"><Icon name="check" size="lg" className="text-theme-status-success" /><p className="text-theme-status-success text-sm text-center">Data available</p></div>;
      }
      return null;
    };

    return (
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
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-theme-border-primary bg-theme-surface-secondary cursor-grab active:cursor-grabbing relative min-h-[2.5rem]"
          style={{ minHeight: '2.5rem' }}
          {...dragHandleProps}
        >
          <div className="flex items-center space-x-3">
            <Icon name={meta.icon} size="sm" className="text-theme-accent-primary" aria-hidden="true" />
            <h3 className="text-base font-semibold text-theme-text-primary truncate">{meta.title}</h3>
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
          {renderStatusContent()}
        </div>
      </div>
    );
  }
);

GenericTile.displayName = 'GenericTile';
