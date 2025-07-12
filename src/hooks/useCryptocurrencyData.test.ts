import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCryptocurrencyData } from './useCryptocurrencyData';
import { waitFor } from '@testing-library/react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';

describe('useCryptocurrencyData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading initially', () => {
    const { result } = renderHook(() => useCryptocurrencyData());
    expect(result.current.loading).toBe(true);
  });

  it('returns data after loading', async () => {
    const mockService = {
      getTopCryptocurrencies: vi.fn().mockResolvedValue([
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          price_change_24h: 1000,
          total_volume: 50000000,
          circulating_supply: 19000000,
          total_supply: 21000000,
          max_supply: 21000000,
          ath: 69000,
          ath_change_percentage: -27.5,
          atl: 67.81,
          atl_change_percentage: 73600,
          last_updated: '2024-07-12T23:00:00Z',
        },
      ]),
    } as unknown as CoinGeckoApiService;
    const { result } = renderHook(() => useCryptocurrencyData(30000, mockService));
    await waitFor(() => {
      expect(result.current.data.length).toBeGreaterThan(0);
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns error on fetch failure', async () => {
    const mockService = {
      getTopCryptocurrencies: vi.fn().mockRejectedValue(new Error('Failed to load cryptocurrency data')),
    } as unknown as CoinGeckoApiService;
    const { result } = renderHook(() => useCryptocurrencyData(30000, mockService));
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load cryptocurrency data');
      expect(result.current.loading).toBe(false);
    });
  });
}); 
