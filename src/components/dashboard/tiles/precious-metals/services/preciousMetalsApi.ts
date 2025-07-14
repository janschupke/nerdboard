import { PRECIOUS_METALS_MOCK_CONFIG } from '../constants';
import type { PreciousMetalsData, PriceHistory, MetalType } from '../types';
import { storageManager } from '../../../../../services/storageManagerUtils';

export class PreciousMetalsApiService {
  async getPreciousMetalsData(): Promise<PreciousMetalsData> {
    const cacheKey = 'dashboard-precious-metals-data';
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as PreciousMetalsData) : null;
    if (cached) return cached;

    try {
      // For now, using mock data since real precious metals APIs often require paid access
      // In a real implementation, this would fetch from a public API
      const mockData: PreciousMetalsData = {
        gold: {
          price: PRECIOUS_METALS_MOCK_CONFIG.GOLD.BASE_PRICE,
          change_24h: PRECIOUS_METALS_MOCK_CONFIG.GOLD.CHANGE_24H,
          change_percentage_24h: PRECIOUS_METALS_MOCK_CONFIG.GOLD.CHANGE_PERCENTAGE_24H,
        },
        silver: {
          price: PRECIOUS_METALS_MOCK_CONFIG.SILVER.BASE_PRICE,
          change_24h: PRECIOUS_METALS_MOCK_CONFIG.SILVER.CHANGE_24H,
          change_percentage_24h: PRECIOUS_METALS_MOCK_CONFIG.SILVER.CHANGE_PERCENTAGE_24H,
        },
      };

      storageManager.setTileConfig(cacheKey, {
        data: mockData as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
      return mockData;
    } catch (error) {
      console.error('Failed to fetch precious metals data:', error);
      throw error;
    }
  }

  async getPreciousMetalsHistory(metal: MetalType, days: number): Promise<PriceHistory[]> {
    const cacheKey = `dashboard-precious-metals-history-${metal}-${days}`;
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as PriceHistory[]) : null;
    if (cached) return cached;

    try {
      // Mock historical data
      const now = Date.now();
      const dayMs = PRECIOUS_METALS_MOCK_CONFIG.TIME_CONSTANTS.DAY_MS;
      const mockData: PriceHistory[] = [];

      const basePrice =
        metal === 'gold'
          ? PRECIOUS_METALS_MOCK_CONFIG.GOLD.BASE_PRICE
          : PRECIOUS_METALS_MOCK_CONFIG.SILVER.BASE_PRICE;
      const volatility =
        metal === 'gold'
          ? PRECIOUS_METALS_MOCK_CONFIG.GOLD.VOLATILITY
          : PRECIOUS_METALS_MOCK_CONFIG.SILVER.VOLATILITY;

      for (let i = days; i >= 0; i--) {
        const timestamp = now - i * dayMs;
        const randomChange = (Math.random() - 0.5) * volatility;
        const price = basePrice + randomChange;

        mockData.push({
          timestamp,
          price: Math.max(price, 0), // Ensure price is never negative
        });
      }

      storageManager.setTileConfig(cacheKey, {
        data: mockData as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
      return mockData;
    } catch (error) {
      console.error('Failed to fetch precious metals history:', error);
      throw error;
    }
  }
}
