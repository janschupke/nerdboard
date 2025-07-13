import type { BaseComponentProps } from './index';

export interface DashboardTile {
  id: string;
  type: 'cryptocurrency' | 'precious-metals' | 'precious_metals' | 'chart' | 'federal_funds_rate' | 'euribor_rate' | 'weather_helsinki' | 'weather_prague' | 'weather_taipei' | 'gdx_etf' | 'time_helsinki' | 'time_prague' | 'time_taipei' | 'uranium';
  position: {
    x: number;
    y: number;
  };
  size: { width: number; height: number } | 'small' | 'medium' | 'large';
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  tiles: DashboardTile[];
  isCollapsed: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardContextType {
  layout: DashboardLayout;
  addTile: ((tile: DashboardTile) => void) & ((type: string) => void);
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  toggleCollapse: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface DashboardProps extends BaseComponentProps {
  initialLayout?: DashboardTile[];
}

export interface TileProps extends BaseComponentProps {
  tile: DashboardTile;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<DashboardTile>) => void;
}

export interface DraggableTileProps extends TileProps {
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, position: { x: number; y: number }) => void;
}

export interface TileGridProps extends BaseComponentProps {
  tiles: DashboardTile[];
  onTileUpdate?: (id: string, updates: Partial<DashboardTile>) => void;
  onTileRemove?: (id: string) => void;
}

export interface SidebarProps extends BaseComponentProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddTile: (type: DashboardTile['type']) => void;
}

export const TileTypeEnum = {
  CRYPTOCURRENCY: 'cryptocurrency',
  PRECIOUS_METALS: 'precious-metals',
  CHART: 'chart',
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

export type TileType =
  | (typeof TileTypeEnum)[keyof typeof TileTypeEnum]
  | keyof typeof TileTypeEnum
  | 'cryptocurrency'
  | 'precious-metals'
  | 'chart'
  | 'precious_metals'
  | 'federal_funds_rate'
  | 'euribor_rate'
  | 'weather_helsinki'
  | 'weather_prague'
  | 'weather_taipei'
  | 'gdx_etf'
  | 'time_helsinki'
  | 'time_prague'
  | 'time_taipei'
  | 'uranium';

export const TileSizeEnum = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type TileSize =
  | (typeof TileSizeEnum)[keyof typeof TileSizeEnum]
  | keyof typeof TileSizeEnum
  | 'small'
  | 'medium'
  | 'large';

// Keep the old consts for backward compatibility
export const TileType = TileTypeEnum;
export const TileSize = TileSizeEnum;
