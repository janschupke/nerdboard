import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CoinGeckoApiService } from './coinGeckoApi';
import { createCryptocurrencyListMockData } from '../test/mocks/factories/cryptocurrencyFactory';
import { API_CONFIG } from '../utils/constants';
import { MockApiService } from '../test/mocks/apiMockService';
import { configureMockForTest } from '../test/setup/mockSetup';

// Ensure fetch is always mocked
vi.stubGlobal('fetch', vi.fn());

// Make all retries and timeouts instant for tests
Object.defineProperty(API_CONFIG, 'RETRY_DELAY', { value: 0, writable: true });
Object.defineProperty(API_CONFIG, 'DEFAULT_TIMEOUT', { value: 0, writable: true });

describe('CoinGeckoApiService', () => {
  let service: CoinGeckoApiService;
  let mockApiService: MockApiService;

  beforeEach(() => {
    service = new CoinGeckoApiService();
    mockApiService = MockApiService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockApiService.clearMocks();
  });

  describe('getTopCryptocurrencies', () => {
    it('should fetch top cryptocurrencies successfully', async () => {
      const mockData = createCryptocurrencyListMockData(5);
      configureMockForTest('/api/coins/markets', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await service.getTopCryptocurrencies(5);

      expect(result).toEqual(mockData);
    });

    it('should use default limit when no limit provided', async () => {
      const mockData = createCryptocurrencyListMockData(10);
      configureMockForTest('/api/coins/markets', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await service.getTopCryptocurrencies();

      expect(result).toEqual(mockData);
    });

    it('should throw error when API request fails', async () => {
      configureMockForTest('/api/coins/markets', {
        shouldFail: true,
        errorType: 'api',
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.getTopCryptocurrencies()).rejects.toThrow(/Failed to fetch cryptocurrency data/);
    });

    it('should throw error when fetch throws', async () => {
      configureMockForTest('/api/coins/markets', {
        shouldFail: true,
        errorType: 'network',
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getTopCryptocurrencies()).rejects.toThrow(/Failed to fetch cryptocurrency data/);
    });

    it('should handle rate limiting with retries', async () => {
      // Use a fixed mock data array for both responses and assertion
      const mockData = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 50000,
          market_cap: 1000000000,
          total_volume: 1000000000,
          price_change_24h: 1000,
          price_change_percentage_24h: 2.5,
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: 4000,
          market_cap: 500000000,
          total_volume: 500000000,
          price_change_24h: 200,
          price_change_percentage_24h: 1.2,
        },
      ];

      configureMockForTest('/api/coins/markets', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

      const result = await service.getTopCryptocurrencies(2);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when all retries are exhausted', async () => {
      configureMockForTest('/api/coins/markets', {
        shouldFail: true,
        errorType: 'api',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.getTopCryptocurrencies()).rejects.toThrow(/Failed to fetch cryptocurrency data/);
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

      configureMockForTest('/api/coins/bitcoin/market_chart', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await service.getPriceHistory('bitcoin', 7);

      expect(result).toEqual([
        { timestamp: 1640995200000, price: 50000 },
        { timestamp: 1641081600000, price: 51000 },
      ]);
    });

    it('should throw error when API request fails', async () => {
      configureMockForTest('/api/coins/bitcoin/market_chart', {
        shouldFail: true,
        errorType: 'api',
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(service.getPriceHistory('bitcoin', 7)).rejects.toThrow(/Failed to fetch price history/);
    });

    it('should throw error when fetch throws', async () => {
      configureMockForTest('/api/coins/bitcoin/market_chart', {
        shouldFail: true,
        errorType: 'network',
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getPriceHistory('bitcoin', 7)).rejects.toThrow(/Failed to fetch price history/);
    });

    it('should throw error when response format is invalid', async () => {
      configureMockForTest('/api/coins/bitcoin/market_chart', {
        responseData: { invalid: 'format' },
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'format' }),
      } as Response);

      await expect(service.getPriceHistory('bitcoin', 7)).rejects.toThrow('Invalid price history response format');
    });

    it('should handle empty price data', async () => {
      const mockData = { prices: [] };

      configureMockForTest('/api/coins/bitcoin/market_chart', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await service.getPriceHistory('bitcoin', 7);

      expect(result).toEqual([]);
    });
  });

  describe('caching behavior', () => {
    it('should use different cache keys for different parameters', async () => {
      const mockData1 = createCryptocurrencyListMockData(5);
      const mockData2 = createCryptocurrencyListMockData(10);

      configureMockForTest('/api/coins/markets', {
        responseData: mockData1,
        delay: 50,
      });

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData2,
        } as Response);

      await service.getTopCryptocurrencies(5);
      await service.getTopCryptocurrencies(10);

      expect(mockData1).not.toEqual(mockData2);
    });

    it('should return cached data for same parameters', async () => {
      const mockData = createCryptocurrencyListMockData(5);

      configureMockForTest('/api/coins/markets', {
        responseData: mockData,
        delay: 50,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // First call
      const result1 = await service.getTopCryptocurrencies(5);
      // Second call should use cache
      const result2 = await service.getTopCryptocurrencies(5);

      expect(result1).toEqual(result2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 
