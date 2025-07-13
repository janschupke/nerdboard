import { URANIUM_API_CONFIG, URANIUM_ERROR_MESSAGES } from '../constants';
import type { UraniumPriceData, UraniumTimeRange, UraniumApiResponse } from '../types';

// Mock data for development and fallback
const mockUraniumData: UraniumPriceData = {
  spotPrice: 85.50,
  change: 2.30,
  changePercent: 2.76,
  lastUpdated: new Date().toISOString(),
  volume: 1250000,
  supply: 65000,
  demand: 68000,
  marketStatus: 'Active',
};

// Mock history data for future chart implementation
// const mockHistoryData = [
//   { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, price: 80.20 },
//   { timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, price: 82.10 },
//   { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, price: 83.40 },
//   { timestamp: Date.now(), price: 85.50 },
// ];

export const uraniumApi = {
  async getUraniumData(timeRange: UraniumTimeRange): Promise<UraniumPriceData> {
    // Use mock data as primary since real APIs are unreliable
    if (URANIUM_API_CONFIG.USE_MOCK_DATA) {
      return this.getMockData(timeRange);
    }

    try {
      // Try primary API first
      const data = await this.fetchFromPrimaryApi(timeRange);
      return data;
    } catch (error) {
      console.warn('Primary uranium API failed, trying fallbacks:', error);
      try {
        // Try fallback APIs
        const data = await this.fetchFromFallbackApis(timeRange);
        return data;
      } catch (fallbackError) {
        console.warn('All uranium APIs failed, using mock data:', fallbackError);
        // Return mock data as final fallback
        return this.getMockData(timeRange);
      }
    }
  },

  async fetchFromPrimaryApi(timeRange: UraniumTimeRange): Promise<UraniumPriceData> {
    const response = await fetch(`${URANIUM_API_CONFIG.BASE_URL}?range=${timeRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`${URANIUM_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
    }

    const data: UraniumApiResponse = await response.json();
    
    return {
      spotPrice: data.spotPrice,
      change: data.change,
      changePercent: data.changePercent,
      lastUpdated: data.lastUpdated,
      volume: data.volume,
      supply: data.supply,
      demand: data.demand,
      marketStatus: data.marketStatus,
    };
  },

  async fetchFromFallbackApis(timeRange: UraniumTimeRange): Promise<UraniumPriceData> {
    // Try multiple fallback sources
    for (const fallbackUrl of URANIUM_API_CONFIG.FALLBACK_URLS) {
      try {
        const response = await fetch(`${fallbackUrl}?range=${timeRange}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: UraniumApiResponse = await response.json();
          return {
            spotPrice: data.spotPrice,
            change: data.change,
            changePercent: data.changePercent,
            lastUpdated: data.lastUpdated,
            volume: data.volume,
            supply: data.supply,
            demand: data.demand,
            marketStatus: data.marketStatus,
          };
        }
      } catch {
        continue;
      }
    }

    throw new Error(URANIUM_ERROR_MESSAGES.NETWORK_ERROR);
  },

  getMockData(timeRange: UraniumTimeRange): UraniumPriceData {
    // Generate mock data based on time range
    const basePrice = 85.50;
    const variation = Math.random() * 10 - 5; // ±5 variation
    
    // Use timeRange to determine price variation (for future implementation)
    const timeRangeMultiplier = timeRange === 'MAX' ? 1.5 : 1.0;
    
    return {
      ...mockUraniumData,
      spotPrice: basePrice + variation * timeRangeMultiplier,
      change: variation,
      changePercent: (variation / basePrice) * 100,
      lastUpdated: new Date().toISOString(),
    };
  },

  // Helper method to simulate web scraping (for future implementation)
  async scrapeUraniumData(): Promise<UraniumPriceData> {
    // This would implement web scraping logic
    // For now, return mock data
    return this.getMockData('1Y');
  },
}; 
