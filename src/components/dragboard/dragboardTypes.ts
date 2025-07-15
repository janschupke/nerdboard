import type { BaseComponentProps } from '../../types/index';
import type { TileType, TileSize } from '../../types/tile';
export type { TileType, TileSize } from '../../types/tile';

export interface DragboardTileData {
  id: string;
  type: TileType;
  position: {
    x: number;
    y: number;
  };
  size: TileSize;
  config?: Record<string, unknown>;
  createdAt?: number;
}

export interface DashboardLayout {
  tiles: DragboardTileData[];
  isCollapsed: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardContextType {
  layout: DashboardLayout;
  addTile: (tileOrType: DragboardTileData | TileType) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DragboardTileData>) => void;
  reorderTiles: (tiles: DragboardTileData[]) => void;
  toggleCollapse: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  refreshAllTiles: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
}

export interface TileGridProps extends BaseComponentProps {
  tiles: DragboardTileData[];
  onTileRemove?: (id: string) => void;
  onTileMove?: (from: number, to: number) => void;
}

export interface DraggableTileProps extends BaseComponentProps {
  tile: DragboardTileData;
  onRemove?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}
