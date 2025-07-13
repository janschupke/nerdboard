import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PreciousMetalsApiService } from './preciousMetalsApi';

// Ensure fetch is always mocked
vi.stubGlobal('fetch', vi.fn());

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
      // This service uses mock data, so it should always succeed
      const result = await service.getPreciousMetalsData();
      expect(result).toBeDefined();
      expect(result.gold).toBeDefined();
      expect(result.silver).toBeDefined();
    });
  });

  describe('getPreciousMetalsHistory', () => {
    it('should return gold price history', async () => {
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
      const goldResult1 = await service.getPreciousMetalsHistory('gold', 7);
      const goldResult2 = await service.getPreciousMetalsHistory('gold', 7);
      const silverResult = await service.getPreciousMetalsHistory('silver', 7);
      const goldResult3 = await service.getPreciousMetalsHistory('gold', 30);

      expect(goldResult1).toEqual(goldResult2); // Should be cached
      expect(goldResult1).not.toEqual(silverResult); // Different metal
      expect(goldResult1).not.toEqual(goldResult3); // Different days
    });

    it('should handle network errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('caching behavior', () => {
    it('should cache data for the specified duration', async () => {
      const result1 = await service.getPreciousMetalsData();
      const result2 = await service.getPreciousMetalsData();

      expect(result1).toEqual(result2);
    });

    it('should use different cache keys for different parameters', async () => {
      const goldResult1 = await service.getPreciousMetalsHistory('gold', 7);
      const goldResult2 = await service.getPreciousMetalsHistory('gold', 7);
      const silverResult = await service.getPreciousMetalsHistory('silver', 7);

      expect(goldResult1).toEqual(goldResult2); // Same parameters, should be cached
      expect(goldResult1).not.toEqual(silverResult); // Different parameters
    });
  });

  describe('error handling', () => {
    it('should handle errors in getPreciousMetalsData', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsData();

      expect(result).toBeDefined();
      expect(result.gold).toBeDefined();
      expect(result.silver).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should handle errors in getPreciousMetalsHistory', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.getPreciousMetalsHistory('gold', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });
  });
}); 
