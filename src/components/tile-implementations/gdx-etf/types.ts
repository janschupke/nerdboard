import type { TileSize } from '../../../types/tile';
import type { TileDataType } from '../../../services/storageManager';

export interface GdxEtfTileData extends TileDataType {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  lastUpdated: string;
  tradingStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}

export interface GdxEtfHistoryEntry {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface GDXETFTileConfig {
  chartPeriod?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
  refreshInterval?: number;
  showVolume?: boolean;
}

export interface GDXETFTileProps {
  id: string;
  size: TileSize;
  config: GDXETFTileConfig;
}

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

export interface MarketHours {
  isOpen: boolean;
  nextOpen: string;
  nextClose: string;
  currentTime: string;
}

export interface GdxEtfApiData extends TileDataType {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  lastUpdated: string;
  tradingStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}
