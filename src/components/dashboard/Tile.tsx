import React, { Suspense } from 'react';
import type { DashboardTile } from '../../types/dashboard';
import { getLazyTileComponent, getTileMeta } from './tiles/TileFactoryRegistry';
// import { TileErrorBoundary } from './tiles/TileErrorBoundary';

interface TileProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export function Tile({
  tile,
  onRemove,
  children,
  dragHandleProps,
  loading,
  error,
  className,
}: TileProps) {
  const LazyTileComponent = getLazyTileComponent(tile.type);
  const meta = getTileMeta(tile.type);
  if (!LazyTileComponent) {
    return (
      <div className="flex items-center justify-center h-full text-theme-secondary">
        <p>Unknown tile type: {tile.type}</p>
      </div>
    );
  }
  if (!meta) {
    return (
      <div className="flex items-center justify-center h-full text-error-600">
        <p>Tile meta missing for type: {tile.type}</p>
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <LazyTileComponent
        tile={tile}
        meta={meta}
        onRemove={onRemove}
        dragHandleProps={dragHandleProps}
        loading={loading}
        error={error}
        className={className}
      >
        {children}
      </LazyTileComponent>
    </Suspense>
  );
}
