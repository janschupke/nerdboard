import type { BaseComponentProps } from '../../types/index';
import type { TileType, TileSize } from '../../types/tile';

export interface DashboardTile {
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
  tiles: DashboardTile[];
  isCollapsed: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardContextType {
  layout: DashboardLayout;
  addTile: (tileOrType: DashboardTile | TileType) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  reorderTiles: (tiles: DashboardTile[]) => void;
  toggleCollapse: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  refreshAllTiles: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
}

export interface TileGridProps extends BaseComponentProps {
  tiles: DashboardTile[];
  onTileRemove?: (id: string) => void;
  onTileMove?: (from: number, to: number) => void;
}

export interface DraggableTileProps extends BaseComponentProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}
