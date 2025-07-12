import { PRECIOUS_METALS_API_CONFIG, PRECIOUS_METALS_MOCK_CONFIG } from '../constants';
import type { PreciousMetalsData, PriceHistory, MetalType } from '../types';

export class PreciousMetalsApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = PRECIOUS_METALS_API_CONFIG.CACHE_DURATION;

  async getPreciousMetalsData(): Promise<PreciousMetalsData> {
    const cacheKey = 'precious-metals-data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as PreciousMetalsData;

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

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('Failed to fetch precious metals data:', error);
      throw error;
    }
  }

  async getPreciousMetalsHistory(metal: MetalType, days: number): Promise<PriceHistory[]> {
    const cacheKey = `precious-metals-history-${metal}-${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as PriceHistory[];

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

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('Failed to fetch precious metals history:', error);
      throw error;
    }
  }

  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
