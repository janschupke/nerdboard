export interface TileConfig {
  id: string;
  type: TileType;
  position: { x: number; y: number };
  size: TileSize;
  config: Record<string, unknown>;
}

export const TileType = {
  CRYPTOCURRENCY: 'cryptocurrency',
  PRECIOUS_METALS: 'precious_metals',
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export const TileSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type TileSize = (typeof TileSize)[keyof typeof TileSize];

export interface DashboardState {
  tiles: TileConfig[];
  sidebarOpen: boolean;
  loading: boolean;
}

export interface DashboardStorage {
  tiles: TileConfig[];
  layout: {
    sidebarOpen: boolean;
    gridColumns: number;
  };
  version: string; // For future migrations
}

export interface DashboardContextType {
  state: DashboardState;
  addTile: (type: TileType) => void;
  removeTile: (id: string) => void;
  toggleSidebar: () => void;
  updateTileConfig: (id: string, config: Partial<TileConfig>) => void;
  moveTile: (from: number, to: number) => void;
}
