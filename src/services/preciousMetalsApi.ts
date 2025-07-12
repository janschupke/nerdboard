import type { PreciousMetalsData } from '../types/preciousMetals';
import type { PriceHistory } from '../types/cryptocurrency';

export class PreciousMetalsApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  async getPreciousMetalsData(): Promise<PreciousMetalsData> {
    const cacheKey = 'precious-metals-data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as PreciousMetalsData;

    try {
      // For now, using mock data since real precious metals APIs often require paid access
      // In a real implementation, this would fetch from a public API
      const mockData: PreciousMetalsData = {
        gold: {
          price: 1950.50,
          change_24h: 12.30,
          change_percentage_24h: 0.63,
        },
        silver: {
          price: 24.75,
          change_24h: -0.15,
          change_percentage_24h: -0.60,
        },
      };

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('Failed to fetch precious metals data:', error);
      throw error;
    }
  }

  async getPreciousMetalsHistory(metal: 'gold' | 'silver', days: number): Promise<PriceHistory[]> {
    const cacheKey = `precious-metals-history-${metal}-${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as PriceHistory[];

    try {
      // Mock historical data
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const mockData: PriceHistory[] = [];
      
      const basePrice = metal === 'gold' ? 1950 : 24.75;
      const volatility = metal === 'gold' ? 50 : 2;

      for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
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
