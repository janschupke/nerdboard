import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGdxEtfApi } from './useGdxEtfApi';
import { registerGdxEtfDataMapper } from './dataMapper';

const mockApiResponse = {
  symbol: 'GDX',
  name: 'VanEck Gold Miners ETF',
  currentPrice: 30.5,
  previousClose: 30.0,
  priceChange: 0.5,
  priceChangePercent: 1.67,
  volume: 1000000,
  marketCap: 1000000000,
  high: 31.0,
  low: 29.5,
  open: 30.1,
  lastUpdated: '2024-06-01T16:00:00Z',
  tradingStatus: 'open',
};

global.fetch = vi.fn();

describe('useGdxEtfApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerGdxEtfDataMapper();
  });

  it('fetches and maps Yahoo Finance GDX ETF data successfully', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });
    const { result } = renderHook(() => useGdxEtfApi());
    let data: Awaited<ReturnType<ReturnType<typeof useGdxEtfApi>["getGDXETF"]>> | undefined;
    await act(async () => {
      data = await result.current.getGDXETF('test-tile');
    });
    expect(data).toBeDefined();
    if (data) {
      expect(data.symbol).toBe('GDX');
      expect(data.currentPrice).toBe(30.5);
      expect(data.tradingStatus).toBe('open');
    }
  });

  it('throws error if API returns not ok', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });
    const { result } = renderHook(() => useGdxEtfApi());
    await expect(result.current.getGDXETF('test-tile')).rejects.toThrow('Yahoo Finance API error');
  });

  it('throws error if fetch fails', async () => {
    (fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useGdxEtfApi());
    await expect(result.current.getGDXETF('test-tile')).rejects.toThrow('Network error');
  });
});
