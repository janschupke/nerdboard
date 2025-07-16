import type { TileSize } from '../../../types/tile';
import type { TileDataType } from '../../../services/storageManager';
import type { BaseApiResponse } from '../../../services/dataMapper';

export interface PreciousMetalTileData extends TileDataType {
  price: number;
  change_24h: number;
  change_percentage_24h: number;
}

export interface PreciousMetalsTileData extends TileDataType {
  gold: PreciousMetalTileData;
  silver: PreciousMetalTileData;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface PreciousMetalsTileConfig {
  chartPeriod?: '7d' | '30d' | '1y';
  selectedMetal?: 'gold' | 'silver';
  refreshInterval?: number;
}

export interface PreciousMetalsTileProps {
  id: string;
  size: TileSize;
  config: PreciousMetalsTileConfig;
}

export type ChartPeriod = '7d' | '30d' | '1y';
export type MetalType = 'gold' | 'silver';

export interface PreciousMetalsApiData extends BaseApiResponse {
  gold: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
  silver: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
}
