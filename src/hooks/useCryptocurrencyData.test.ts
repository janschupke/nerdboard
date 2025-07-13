import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useCryptocurrencyData } from './useCryptocurrencyData';
import {
  createCryptocurrencyListMockData,
  createCryptocurrencyMockData,
} from '../test/mocks/factories/cryptocurrencyFactory';
import { CoinGeckoApiService } from '../services/coinGeckoApi';

describe('useCryptocurrencyData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading initially', () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockResolvedValue([]);
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    expect(result.current.loading).toBe(true);
  });

  it('returns data after loading', async () => {
    const mockData = createCryptocurrencyListMockData(5);
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockResolvedValue(mockData);
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.data.length).toBeGreaterThan(0);
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
  });

  it('returns error on fetch failure', async () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(
      new Error('Network error: Failed to fetch'),
    );
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Network error: Failed to fetch');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API errors correctly', async () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(
      new Error('API error: 500 Internal Server Error'),
    );
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('API error: 500 Internal Server Error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles timeout errors correctly', async () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(
      new Error('Request timeout'),
    );
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Request timeout');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles malformed response errors', async () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(
      new Error('Invalid JSON response'),
    );
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Invalid JSON response');
      expect(result.current.loading).toBe(false);
    });
  });

  it('increments retry count on error', async () => {
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(
      new Error('Network error'),
    );
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.retryCount).toBeGreaterThan(0);
    });
  });

  it('resets retry count on successful fetch', async () => {
    const mockData = createCryptocurrencyListMockData(5);
    vi.spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockResolvedValue(mockData);
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.retryCount).toBe(0);
    });
  });

  it('provides refetch function', async () => {
    const mockData = createCryptocurrencyListMockData(5);
    const spy = vi
      .spyOn(CoinGeckoApiService.prototype, 'getTopCryptocurrencies')
      .mockResolvedValue(mockData);
    const { result } = renderHook(() => useCryptocurrencyData({ refreshInterval: 30000 }));
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    expect(typeof result.current.refetch).toBe('function');
    const newCoin = createCryptocurrencyMockData({ id: 'new-coin', name: 'New Coin' });
    spy.mockResolvedValueOnce([...mockData, newCoin]);
    result.current.refetch();
    await vi.waitFor(() => {
      expect(result.current.retryCount).toBe(0);
    });
  });
});
