import React, { Suspense, memo } from 'react';
import type { DashboardTile } from '../dragboard';
import { getLazyTileComponent, getTileMeta } from './TileFactoryRegistry';
import { TileErrorBoundary } from './TileErrorBoundary';

interface TileProps {
  tile: DashboardTile;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
}

const TileComponent = ({ tile, dragHandleProps, onRemove }: TileProps) => {
  const LazyTileComponent = getLazyTileComponent(tile.type);
  const meta = getTileMeta(tile.type);

  if (!LazyTileComponent || !meta) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-theme-text-tertiary">
        <p>Unknown tile type: {tile.type}</p>
      </div>
    );
  }

  return (
    <TileErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent-primary"></div>
          </div>
        }
      >
        <LazyTileComponent
          tile={tile}
          meta={meta}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
        />
      </Suspense>
    </TileErrorBoundary>
  );
};

export const Tile = memo(TileComponent);
