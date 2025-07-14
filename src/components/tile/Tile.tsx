import React, { Suspense } from 'react';
import type { DashboardTile } from '../dragboard/dashboard';
import type { DraggableTileProps } from '../dragboard/DragboardTile';
import { getLazyTileComponent, getTileMeta } from './TileFactoryRegistry';
import { TileErrorBoundary } from './TileErrorBoundary';

interface TileProps extends DraggableTileProps {
  tile: DashboardTile;
}

export function Tile({ tile, dragHandleProps, onRemove, ...draggableProps }: TileProps) {
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
      <Suspense fallback={
        <div className="flex items-center justify-center h-full p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent-primary"></div>
        </div>
      }>
        <LazyTileComponent 
          tile={tile} 
          meta={meta} 
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
          {...draggableProps}
        />
      </Suspense>
    </TileErrorBoundary>
  );
} 
