import type { TileSize } from '../../../types/tile';
import type { TileDataType } from '../../../services/storageManager';

export interface UraniumTileData extends TileDataType {
  spotPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  volume?: number;
  supply?: number;
  demand?: number;
  marketStatus?: string;
  history: UraniumPriceHistory[];
}

export interface UraniumPriceHistory {
  date: string;
  price: number;
}

export interface UraniumTileConfig {
  timeRange?: UraniumTimeRange;
  refreshInterval?: number;
}

export interface UraniumTileProps {
  id: string;
  size: TileSize;
  config: UraniumTileConfig;
}

export type UraniumTimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

export interface UraniumApiData {
  spotPrice: number;
  history: UraniumPriceHistory[];
  change: number;
  changePercent: number;
  lastUpdated: string;
  volume?: number;
  supply?: number;
  demand?: number;
  marketStatus?: string;
}
