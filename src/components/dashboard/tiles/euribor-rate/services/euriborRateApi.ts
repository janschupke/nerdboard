import { EURIBOR_RATE_CONFIG } from '../constants';
import type { EuriborRateData, TimeRange } from '../types';

export class EuriborRateApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = EURIBOR_RATE_CONFIG.CACHE_DURATION;

  async getEuriborRateData(timeRange: TimeRange = '1Y'): Promise<EuriborRateData> {
    const cacheKey = `euribor-rate-${timeRange}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as EuriborRateData;

    // Use mock data as primary since real APIs are unreliable
    const mockData = this.getMockData(timeRange);
    this.setCachedData(cacheKey, mockData);
    return mockData;

    // Commented out real API calls due to reliability issues
    /*
    try {
      // Try EMMI API first
      const data = await this.fetchFromEmmiApi(timeRange);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('EMMI API failed, trying ECB API:', error);
      
      try {
        // Fallback to ECB API
        const data = await this.fetchFromEcbApi();
        this.setCachedData(cacheKey, data);
        return data;
      } catch (ecbError) {
        console.error('Both EMMI and ECB APIs failed:', ecbError);
        // Final fallback to mock data
        const mockData = this.getMockData(timeRange);
        this.setCachedData(cacheKey, mockData);
        return mockData;
      }
    }
    */
  }

  private getMockData(timeRange: TimeRange): EuriborRateData {
    // Generate mock data for development/testing
    const now = new Date();
    const historicalData: Array<{ date: Date; rate: number }> = [];

    // Generate data points for the specified time range
    const days = this.getDaysForTimeRange(timeRange);
    const baseRate = 3.85; // Current approximate Euribor rate

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Use deterministic variation for testing
      const variation = Math.sin(i * 0.1) * 0.15;
      const rate = Math.max(0, baseRate + variation);

      historicalData.push({
        date,
        rate: parseFloat(rate.toFixed(2)),
      });
    }

    return {
      currentRate: historicalData[historicalData.length - 1]?.rate || baseRate,
      lastUpdate: now,
      historicalData,
    };
  }

  private getDaysForTimeRange(timeRange: TimeRange): number {
    const timeRangeMap = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825,
      Max: 3650,
    };

    return timeRangeMap[timeRange] || 365;
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
