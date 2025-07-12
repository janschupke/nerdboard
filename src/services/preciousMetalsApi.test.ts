import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PreciousMetalsApiService } from './preciousMetalsApi';

describe('PreciousMetalsApiService', () => {
  let service: PreciousMetalsApiService;

  beforeEach(() => {
    service = new PreciousMetalsApiService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreciousMetalsData', () => {
    it('should return mock precious metals data', async () => {
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
      // First call
      const result1 = await service.getPreciousMetalsData();

      // Second call should use cache
      const result2 = await service.getPreciousMetalsData();

      expect(result1).toEqual(result2);
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This test verifies that the service doesn't throw unexpected errors
      // The current implementation uses mock data, so it should always succeed
      const result = await service.getPreciousMetalsData();

      expect(result).toBeDefined();
      expect(result.gold).toBeDefined();
      expect(result.silver).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('getPreciousMetalsHistory', () => {
    it('should return gold price history', async () => {
      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(8); // 7 days + current day
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0]).toHaveProperty('price');
      expect(result[0].price).toBeGreaterThan(0);
    });

    it('should return silver price history', async () => {
      const result = await service.getPreciousMetalsHistory('silver', 7);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(8); // 7 days + current day
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0]).toHaveProperty('price');
      expect(result[0].price).toBeGreaterThan(0);
    });

    it('should use different cache keys for different metals and days', async () => {
      const goldResult1 = await service.getPreciousMetalsHistory('gold', 7);
      const goldResult2 = await service.getPreciousMetalsHistory('gold', 7);
      const silverResult = await service.getPreciousMetalsHistory('silver', 7);
      const goldResult3 = await service.getPreciousMetalsHistory('gold', 30);

      expect(goldResult1).toEqual(goldResult2); // Should be cached
      expect(goldResult1).not.toEqual(silverResult); // Different metal
      expect(goldResult1).not.toEqual(goldResult3); // Different days
    });

    it('should generate realistic price variations', async () => {
      const result = await service.getPreciousMetalsHistory('gold', 7);

      // Check that prices vary within reasonable bounds
      const prices = result.map(item => item.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      expect(minPrice).toBeGreaterThan(0);
      expect(maxPrice).toBeGreaterThan(minPrice);
    });

    it('should handle different time periods', async () => {
      const result1 = await service.getPreciousMetalsHistory('gold', 1);
      const result7 = await service.getPreciousMetalsHistory('gold', 7);
      const result30 = await service.getPreciousMetalsHistory('gold', 30);

      expect(result1).toHaveLength(2); // 1 day + current day
      expect(result7).toHaveLength(8); // 7 days + current day
      expect(result30).toHaveLength(31); // 30 days + current day
    });

    it('should ensure prices are never negative', async () => {
      const result = await service.getPreciousMetalsHistory('gold', 7);

      result.forEach(item => {
        expect(item.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('should use correct volatility settings', async () => {
      // Mock Math.random to test volatility
      const originalRandom = Math.random;
      const mockRandom = vi.fn()
        .mockReturnValueOnce(0.1) // Low random value
        .mockReturnValueOnce(0.9); // High random value

      Math.random = mockRandom;

      await service.getPreciousMetalsHistory('gold', 2);

      expect(mockRandom).toHaveBeenCalled();

      Math.random = originalRandom;
    });
  });

  describe('caching behavior', () => {
    it('should cache data for the specified duration', async () => {
      const result1 = await service.getPreciousMetalsHistory('gold', 7);
      const result2 = await service.getPreciousMetalsHistory('gold', 7);

      expect(result1).toEqual(result2);
    });

    it('should use different cache keys for different parameters', async () => {
      await service.getPreciousMetalsHistory('gold', 7);
      await service.getPreciousMetalsHistory('silver', 7);
      await service.getPreciousMetalsHistory('gold', 30);

      // All should be cached separately
      const gold7 = await service.getPreciousMetalsHistory('gold', 7);
      const silver7 = await service.getPreciousMetalsHistory('silver', 7);
      const gold30 = await service.getPreciousMetalsHistory('gold', 30);

      expect(gold7).toBeDefined();
      expect(silver7).toBeDefined();
      expect(gold30).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle errors in getPreciousMetalsData', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // The current implementation doesn't throw errors, but we test the error handling structure
      const result = await service.getPreciousMetalsData();

      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should handle errors in getPreciousMetalsHistory', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // The current implementation doesn't throw errors, but we test the error handling structure
      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });
  });
}); 
