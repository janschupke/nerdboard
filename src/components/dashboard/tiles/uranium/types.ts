import type { TileSize } from '../../../../types/dashboard';

export interface UraniumPriceData {
  spotPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  volume?: number;
  supply?: number;
  demand?: number;
  marketStatus?: string;
}

export interface UraniumPriceHistory {
  timestamp: number;
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

export type UraniumTimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

export interface UraniumApiResponse {
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
