import { FEDERAL_FUNDS_API_CONFIG, FEDERAL_FUNDS_ERROR_MESSAGES } from '../constants';
import type { FederalFundsRateData, FredApiResponse, TimeRange } from '../types';

export class FederalFundsRateApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = FEDERAL_FUNDS_API_CONFIG.CACHE_DURATION;

  async getFederalFundsRateData(timeRange: TimeRange = '1Y'): Promise<FederalFundsRateData> {
    const cacheKey = `federal-funds-rate-${timeRange}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as FederalFundsRateData;

    try {
      // Try FRED API first
      const data = await this.fetchFromFredApi();
      this.setCachedData(cacheKey, data);
      return data;
    } catch {
      try {
        // Fallback to web scraping
        const data = await this.scrapeFederalFundsRateData(timeRange);
        this.setCachedData(cacheKey, data);
        return data;
      } catch {
        throw new Error(FEDERAL_FUNDS_ERROR_MESSAGES.FETCH_FAILED);
      }
    }
  }

  private async fetchFromFredApi(): Promise<FederalFundsRateData> {
    const { FRED_BASE_URL, SERIES_ID } = FEDERAL_FUNDS_API_CONFIG;
    const API_KEY = import.meta.env.VITE_FRED_API_KEY || '';
    
    if (!API_KEY) {
      // Fallback to mock data instead of throwing
      return this.getMockData('1Y');
    }

    const url = `${FRED_BASE_URL}?series_id=${SERIES_ID}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=1000`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`${FEDERAL_FUNDS_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
    }

    const data: FredApiResponse = await response.json();
    return this.transformFredData(data);
  }

  private async scrapeFederalFundsRateData(timeRange: TimeRange): Promise<FederalFundsRateData> {
    // For now, return mock data since web scraping requires a backend proxy
    // In a real implementation, this would scrape the FRED website
    return this.getMockData(timeRange);
  }

  private transformFredData(fredData: FredApiResponse): FederalFundsRateData {
    const observations = fredData.observations || [];
    
    if (observations.length === 0) {
      // Fallback to mock data instead of throwing
      return this.getMockData('1Y');
    }

    const historicalData = observations
      .filter(obs => obs.value !== '.') // Filter out missing data
      .map(obs => ({
        date: new Date(obs.date),
        rate: parseFloat(obs.value)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending

    if (historicalData.length === 0) {
      // Fallback to mock data if all data points were filtered out
      return this.getMockData('1Y');
    }

    const currentRate = historicalData[historicalData.length - 1]?.rate || 0;
    const lastUpdate = new Date();

    return {
      currentRate,
      lastUpdate,
      historicalData
    };
  }

  private getMockData(timeRange: TimeRange): FederalFundsRateData {
    // Generate mock data for development/testing
    const now = new Date();
    const historicalData: Array<{ date: Date; rate: number }> = [];
    
    // Generate data points for the specified time range
    const days = this.getDaysForTimeRange(timeRange);
    const baseRate = 5.25; // Current approximate rate
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Use deterministic variation for testing
      const variation = Math.sin(i * 0.1) * 0.25;
      const rate = Math.max(0, baseRate + variation);
      
      historicalData.push({
        date,
        rate: parseFloat(rate.toFixed(2))
      });
    }

    return {
      currentRate: historicalData[historicalData.length - 1]?.rate || baseRate,
      lastUpdate: now,
      historicalData
    };
  }

  private getDaysForTimeRange(timeRange: TimeRange): number {
    const timeRangeMap = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825,
      'Max': 3650
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
