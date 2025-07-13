import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PreciousMetalsApiService } from './preciousMetalsApi';
import { MockApiService } from '../test/mocks/apiMockService';
import { configureMockForTest } from '../test/setup/mockSetup';
import { createPreciousMetalsListMockData } from '../test/mocks/factories/preciousMetalsFactory';

// Ensure fetch is always mocked
vi.stubGlobal('fetch', vi.fn());

describe('PreciousMetalsApiService', () => {
  let service: PreciousMetalsApiService;
  let mockApiService: MockApiService;

  beforeEach(() => {
    service = new PreciousMetalsApiService();
    mockApiService = MockApiService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockApiService.clearMocks();
  });

  describe('getPreciousMetalsData', () => {
    it('should return mock precious metals data', async () => {
      const mockData = createPreciousMetalsListMockData();
      configureMockForTest('/api/metals/prices', {
        responseData: mockData,
        delay: 50,
      });

      const result = await service.getPreciousMetalsData();

      expect(result).toEqual({
        gold: {
          price: 1950.5,
          change_24h: 12.3,
          change_percentage_24h: 0.63,
        },
        silver: {
          price: 24.75,
          change_24h: -0.15,
          change_percentage_24h: -0.6,
        },
      });
    });

    it('should cache results and return cached data', async () => {
      const mockData = createPreciousMetalsListMockData();
      configureMockForTest('/api/metals/prices', {
        responseData: mockData,
        delay: 50,
      });

      // First call
      const result1 = await service.getPreciousMetalsData();

      // Second call should use cache
      const result2 = await service.getPreciousMetalsData();

      expect(result1).toEqual(result2);
    });

    it('should handle errors gracefully', async () => {
      configureMockForTest('/api/metals/prices', {
        shouldFail: true,
        errorType: 'network',
      });

      const result = await service.getPreciousMetalsData();
      expect(result).toBeDefined();
      expect(result.gold).toBeDefined();
      expect(result.silver).toBeDefined();
    });
  });

  describe('getPreciousMetalsHistory', () => {
    it('should return gold price history', async () => {
      const mockHistory = [
        { timestamp: 1640995200000, price: 1950.5 },
        { timestamp: 1641081600000, price: 1955.2 },
      ];

      configureMockForTest('/api/metals/gold/history', {
        responseData: { prices: mockHistory },
        delay: 50,
      });

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first item
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('timestamp');
      expect(firstItem).toHaveProperty('price');
      expect(typeof firstItem.timestamp).toBe('number');
      expect(typeof firstItem.price).toBe('number');
    });

    it('should return silver price history', async () => {
      const mockHistory = [
        { timestamp: 1640995200000, price: 24.75 },
        { timestamp: 1641081600000, price: 24.8 },
      ];

      configureMockForTest('/api/metals/silver/history', {
        responseData: { prices: mockHistory },
        delay: 50,
      });

      const result = await service.getPreciousMetalsHistory('silver', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first item
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('timestamp');
      expect(firstItem).toHaveProperty('price');
      expect(typeof firstItem.timestamp).toBe('number');
      expect(typeof firstItem.price).toBe('number');
    });

    it('should use different cache keys for different metals and days', async () => {
      const mockGoldHistory = [
        { timestamp: 1640995200000, price: 1950.5 },
        { timestamp: 1641081600000, price: 1955.2 },
      ];

      const mockSilverHistory = [
        { timestamp: 1640995200000, price: 24.75 },
        { timestamp: 1641081600000, price: 24.8 },
      ];

      configureMockForTest('/api/metals/gold/history', {
        responseData: { prices: mockGoldHistory },
        delay: 50,
      });

      configureMockForTest('/api/metals/silver/history', {
        responseData: { prices: mockSilverHistory },
        delay: 50,
      });

      const goldResult1 = await service.getPreciousMetalsHistory('gold', 7);
      const goldResult2 = await service.getPreciousMetalsHistory('gold', 7);
      const silverResult = await service.getPreciousMetalsHistory('silver', 7);
      const goldResult3 = await service.getPreciousMetalsHistory('gold', 30);

      expect(goldResult1).toEqual(goldResult2); // Should be cached
      expect(goldResult1).not.toEqual(silverResult); // Different metal
      expect(goldResult1).not.toEqual(goldResult3); // Different days
    });

    it('should handle network errors gracefully', async () => {
      configureMockForTest('/api/metals/gold/history', {
        shouldFail: true,
        errorType: 'network',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should handle API errors gracefully', async () => {
      configureMockForTest('/api/metals/gold/history', {
        shouldFail: true,
        errorType: 'api',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('caching behavior', () => {
    it('should cache data for the specified duration', async () => {
      const mockData = createPreciousMetalsListMockData();
      configureMockForTest('/api/metals/prices', {
        responseData: mockData,
        delay: 50,
      });

      const result1 = await service.getPreciousMetalsData();
      const result2 = await service.getPreciousMetalsData();

      expect(result1).toEqual(result2);
    });

    it('should use different cache keys for different parameters', async () => {
      const mockGoldHistory = [
        { timestamp: 1640995200000, price: 1950.5 },
        { timestamp: 1641081600000, price: 1955.2 },
      ];

      const mockSilverHistory = [
        { timestamp: 1640995200000, price: 24.75 },
        { timestamp: 1641081600000, price: 24.8 },
      ];

      configureMockForTest('/api/metals/gold/history', {
        responseData: { prices: mockGoldHistory },
        delay: 50,
      });

      configureMockForTest('/api/metals/silver/history', {
        responseData: { prices: mockSilverHistory },
        delay: 50,
      });

      const goldResult1 = await service.getPreciousMetalsHistory('gold', 7);
      const goldResult2 = await service.getPreciousMetalsHistory('gold', 7);
      const silverResult = await service.getPreciousMetalsHistory('silver', 7);

      expect(goldResult1).toEqual(goldResult2); // Same parameters, should be cached
      expect(goldResult1).not.toEqual(silverResult); // Different parameters
    });
  });

  describe('error handling', () => {
    it('should handle errors in getPreciousMetalsData', async () => {
      configureMockForTest('/api/metals/prices', {
        shouldFail: true,
        errorType: 'network',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsData();

      expect(result).toBeDefined();
      expect(result.gold).toBeDefined();
      expect(result.silver).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should handle errors in getPreciousMetalsHistory', async () => {
      configureMockForTest('/api/metals/gold/history', {
        shouldFail: true,
        errorType: 'api',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
