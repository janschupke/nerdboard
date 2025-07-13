import { EURIBOR_RATE_CONFIG, EURIBOR_RATE_ERROR_MESSAGES } from '../constants';
import type { EuriborRateData, EuriborRateApiResponse, TimeRange } from '../types';

export class EuriborRateApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = EURIBOR_RATE_CONFIG.CACHE_DURATION;

  async getEuriborRateData(timeRange: TimeRange = '1Y'): Promise<EuriborRateData> {
    const cacheKey = `euribor-rate-${timeRange}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as EuriborRateData;

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
  }

  private async fetchFromEmmiApi(timeRange: TimeRange): Promise<EuriborRateData> {
    const { EMMI_API_BASE } = EURIBOR_RATE_CONFIG;
    
    const url = `${EMMI_API_BASE}/euribor-rates?period=${timeRange}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`${EURIBOR_RATE_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
    }

    const data: EuriborRateApiResponse = await response.json();
    return this.transformEmmiData(data);
  }

  private async fetchFromEcbApi(): Promise<EuriborRateData> {
    const { ECB_API_BASE } = EURIBOR_RATE_CONFIG;
    
    // ECB API endpoint for Euribor rates
    const url = `${ECB_API_BASE}/D.EURIBOR12MD.EUR.SP00.A`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`${EURIBOR_RATE_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
    }

    const data = await response.json();
    return this.transformEcbData(data);
  }

  private transformEmmiData(emmiData: EuriborRateApiResponse): EuriborRateData {
    const rates = emmiData.rates || [];
    
    if (rates.length === 0) {
      return this.getMockData('1Y');
    }

    const historicalData = rates
      .filter(rate => rate.value !== '.' && rate.value !== '')
      .map(rate => ({
        date: new Date(rate.date),
        rate: parseFloat(rate.value)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (historicalData.length === 0) {
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

  private transformEcbData(ecbData: unknown): EuriborRateData {
    // Transform ECB data format to our standard format
    const data = ecbData as { dataSets?: Array<{ series?: Array<{ observations?: Record<string, Array<{ value: string }>> }> }> };
    const observations = data?.dataSets?.[0]?.series?.[0]?.observations || {};
    
    if (Object.keys(observations).length === 0) {
      return this.getMockData('1Y');
    }

    const historicalData = Object.entries(observations)
      .map(([key, value]: [string, Array<{ value: string }>]) => ({
        date: new Date(parseInt(key) * 1000),
        rate: parseFloat(value[0]?.value || '0')
      }))
      .filter(point => !isNaN(point.rate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (historicalData.length === 0) {
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
