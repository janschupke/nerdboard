import type { TileSize } from '../../../../types/dashboard';

export interface FederalFundsRateData {
  currentRate: number;
  lastUpdate: Date;
  historicalData: HistoricalRateData[];
}

export interface HistoricalRateData {
  date: Date;
  rate: number;
}

export interface FederalFundsRateTileConfig {
  timeRange?: TimeRange;
  refreshInterval?: number;
}

export interface FederalFundsRateTileProps {
  id: string;
  size: TileSize;
  config: FederalFundsRateTileConfig;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

export interface FredApiResponse {
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

export interface ScrapedRateData {
  rate: number;
  date: string;
}
