import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CoinGeckoApiService } from './coinGeckoApi';

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as typeof globalThis & { fetch: ReturnType<typeof vi.fn> }).fetch = mockFetch;

describe('CoinGeckoApiService', () => {
  let service: CoinGeckoApiService;

  beforeEach(() => {
    service = new CoinGeckoApiService();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopCryptocurrencies', () => {
    it('should fetch top cryptocurrencies successfully', async () => {
      const mockData = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          price_change_percentage_24h: 2.5,
          image: 'https://example.com/bitcoin.png',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.getTopCryptocurrencies(5);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'
      );
    });

    it('should use default limit when no limit provided', async () => {
      const mockData = [{ id: 'bitcoin', name: 'Bitcoin' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      await service.getTopCryptocurrencies();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      );
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getTopCryptocurrencies()).rejects.toThrow('API request failed: 500');
    });

    it('should throw error when fetch throws', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(service.getTopCryptocurrencies()).rejects.toThrow('Network error');
    });

    it('should cache results and return cached data', async () => {
      const mockData = [{ id: 'bitcoin', name: 'Bitcoin' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      // First call
      await service.getTopCryptocurrencies(5);

      // Second call should use cache
      const result = await service.getTopCryptocurrencies(5);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should only call once due to caching
    });
  });

  describe('getPriceHistory', () => {
    it('should fetch price history successfully', async () => {
      const mockData = {
        prices: [
          [1640995200000, 50000],
          [1641081600000, 51000],
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.getPriceHistory('bitcoin', 7);

      expect(result).toEqual([
        { timestamp: 1640995200000, price: 50000 },
        { timestamp: 1641081600000, price: 51000 },
      ]);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7'
      );
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getPriceHistory('bitcoin', 7)).rejects.toThrow('API request failed: 404');
    });

    it('should throw error when fetch throws', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(service.getPriceHistory('bitcoin', 7)).rejects.toThrow('Network error');
    });

    it('should cache results and return cached data', async () => {
      const mockData = {
        prices: [[1640995200000, 50000]],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      // First call
      await service.getPriceHistory('bitcoin', 7);

      // Second call should use cache
      const result = await service.getPriceHistory('bitcoin', 7);

      expect(result).toEqual([{ timestamp: 1640995200000, price: 50000 }]);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should only call once due to caching
    });

    it('should handle empty price data', async () => {
      const mockData = { prices: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await service.getPriceHistory('bitcoin', 7);

      expect(result).toEqual([]);
    });
  });

  describe('caching behavior', () => {
    it('should use different cache keys for different parameters', async () => {
      const mockData1 = [{ id: 'bitcoin' }];
      const mockData2 = [{ id: 'ethereum' }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData1),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData2),
        });

      await service.getTopCryptocurrencies(5);
      await service.getTopCryptocurrencies(10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should expire cache after cache duration', async () => {
      const mockData = [{ id: 'bitcoin' }];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      // First call
      await service.getTopCryptocurrencies(5);

      // Mock time passing to expire cache
      vi.advanceTimersByTime(31000); // Cache duration is 30 seconds

      // Second call should not use cache
      await service.getTopCryptocurrencies(5);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
}); 
