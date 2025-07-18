import type { GdxEtfApiResponse, GdxEtfTileData } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps GDX ETF API response to GdxEtfTileData for the tile.
 */
export const gdxEtfDataMapper: DataMapper<GdxEtfApiResponse, GdxEtfTileData> = {
  map: (apiResponse: GdxEtfApiResponse): GdxEtfTileData => ({
    symbol: apiResponse.symbol,
    name: apiResponse.name,
    currentPrice: apiResponse.currentPrice,
    previousClose: apiResponse.previousClose,
    priceChange: apiResponse.priceChange,
    priceChangePercent: apiResponse.priceChangePercent,
    volume: apiResponse.volume,
    marketCap: apiResponse.marketCap,
    high: apiResponse.high,
    low: apiResponse.low,
    open: apiResponse.open,
    lastUpdated: apiResponse.lastUpdated,
    tradingStatus: apiResponse.tradingStatus,
  }),
  safeMap(apiResponse: GdxEtfApiResponse): GdxEtfTileData {
    try {
      return this.map(apiResponse);
    } catch {
      return this.createDefault();
    }
  },
  validate: (data: unknown): data is GdxEtfApiResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as GdxEtfApiResponse).symbol === 'string' &&
      typeof (data as GdxEtfApiResponse).currentPrice === 'number' &&
      typeof (data as GdxEtfApiResponse).tradingStatus === 'string'
    );
  },
  createDefault: (): GdxEtfTileData => ({
    symbol: '',
    name: '',
    currentPrice: 0,
    previousClose: 0,
    priceChange: 0,
    priceChangePercent: 0,
    volume: 0,
    marketCap: 0,
    high: 0,
    low: 0,
    open: 0,
    lastUpdated: '',
    tradingStatus: 'closed',
  }),
};
