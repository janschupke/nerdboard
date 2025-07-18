import React from 'react';
import type { DragboardTileData } from '../dragboard';

export interface TileProps {
  tile: DragboardTileData;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  refreshKey?: number;
}

export const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent-primary"></div>
    </div>
  );
};
