import type { BaseComponentProps } from '../../types/index';

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

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  onTileSelect: (tileType: TileType) => void;
}

// Proper const assertions for tile types
export const TileType = {
  CRYPTOCURRENCY: 'cryptocurrency',
  PRECIOUS_METALS: 'precious-metals',
  FEDERAL_FUNDS_RATE: 'federal_funds_rate',
  EURIBOR_RATE: 'euribor_rate',
  WEATHER_HELSINKI: 'weather_helsinki',
  WEATHER_PRAGUE: 'weather_prague',
  WEATHER_TAIPEI: 'weather_taipei',
  GDX_ETF: 'gdx_etf',
  TIME_HELSINKI: 'time_helsinki',
  TIME_PRAGUE: 'time_prague',
  TIME_TAIPEI: 'time_taipei',
  URANIUM: 'uranium',
} as const;

export const TileSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];
export type TileSize = (typeof TileSize)[keyof typeof TileSize];

// Type aliases for backward compatibility
export type TileTypeValue = string;
export type TileSizeValue = string;
