import type { GdxEtfApiResponse, GdxEtfTileData } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps GDX ETF API response to GdxEtfTileData for the tile.
 */
export const gdxEtfDataMapper: DataMapper<GdxEtfApiResponse, GdxEtfTileData> = {
  map: (apiResponse: GdxEtfApiResponse): GdxEtfTileData => {
    // Handle Alpha Vantage GLOBAL_QUOTE response format
    const globalQuote = apiResponse['Global Quote'];
    if (globalQuote && globalQuote['01. symbol'] && globalQuote['05. price']) {
      return {
        symbol: globalQuote['01. symbol'],
        name: 'VanEck Gold Miners ETF', // Alpha Vantage doesn't provide name in GLOBAL_QUOTE
        currentPrice: parseFloat(globalQuote['05. price']),
        previousClose: parseFloat(globalQuote['08. previous close'] || '0'),
        priceChange: parseFloat(globalQuote['09. change'] || '0'),
        priceChangePercent: parseFloat(globalQuote['10. change percent']?.replace('%', '') || '0'),
        volume: parseInt(globalQuote['06. volume'] || '0'),
        marketCap: 0, // Alpha Vantage doesn't provide market cap in GLOBAL_QUOTE
        high: parseFloat(globalQuote['03. high'] || '0'),
        low: parseFloat(globalQuote['04. low'] || '0'),
        open: parseFloat(globalQuote['02. open'] || '0'),
        lastUpdated: globalQuote['07. latest trading day'] || '',
        tradingStatus: 'open', // Alpha Vantage doesn't provide trading status in GLOBAL_QUOTE
      };
    }

    // Fallback to direct property access for backward compatibility
    if (apiResponse.symbol && apiResponse.currentPrice) {
      return {
        symbol: apiResponse.symbol,
        name: apiResponse.name || 'VanEck Gold Miners ETF',
        currentPrice: apiResponse.currentPrice,
        previousClose: apiResponse.previousClose || 0,
        priceChange: apiResponse.priceChange || 0,
        priceChangePercent: apiResponse.priceChangePercent || 0,
        volume: apiResponse.volume || 0,
        marketCap: apiResponse.marketCap || 0,
        high: apiResponse.high || 0,
        low: apiResponse.low || 0,
        open: apiResponse.open || 0,
        lastUpdated: apiResponse.lastUpdated || '',
        tradingStatus: apiResponse.tradingStatus || 'closed',
      };
    }

    // Return null if no valid data found
    throw new Error('No valid data found in API response');
  },
  safeMap(apiResponse: GdxEtfApiResponse): GdxEtfTileData {
    try {
      return this.map(apiResponse);
    } catch {
      throw new Error('Failed to map GDX ETF data - no valid data available');
    }
  },
  validate: (data: unknown): data is GdxEtfApiResponse => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const response = data as GdxEtfApiResponse;

    // Check for Alpha Vantage GLOBAL_QUOTE format
    if (response['Global Quote']) {
      const globalQuote = response['Global Quote'];
      return (
        typeof globalQuote['01. symbol'] === 'string' &&
        typeof globalQuote['05. price'] === 'string' &&
        globalQuote['01. symbol'].length > 0 &&
        globalQuote['05. price'].length > 0
      );
    }

    // Check for direct property format
    return (
      typeof response.symbol === 'string' &&
      typeof response.currentPrice === 'number' &&
      response.symbol.length > 0 &&
      response.currentPrice > 0
    );
  },
};
