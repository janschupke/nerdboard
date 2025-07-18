import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGdxEtfApi } from './useGdxEtfApi';
import './dataMapper';
import type { GdxEtfTileData } from './types';
import { EndpointTestUtils } from '../../../test/utils/endpointTestUtils';
import { ALPHA_VANTAGE_GDX_ENDPOINT } from '../../../services/apiEndpoints';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';

global.fetch = vi.fn();

describe('useGdxEtfApi', () => {
  const mockTileId = 'test-gdx-tile';
  const mockParams: AlphaVantageParams = {
    function: 'GLOBAL_QUOTE',
    symbol: 'GDX',
    apikey: 'demo',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // registerGdxEtfDataMapper(); // This line is removed as per the new_code
    EndpointTestUtils.configureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      shouldFail: false,
      status: 200,
      responseData: {
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
      },
    });
  });

  it('fetches and maps Alpha Vantage GDX ETF data successfully', async () => {
    const { result } = renderHook(() => useGdxEtfApi());
    let data: GdxEtfTileData = {
      symbol: '',
      name: '',
      currentPrice: 0,
      previousClose: 0,
      priceChange: 0,
      priceChangePercent: 0,
      volume: 0,
      marketCap: 0,
      high: 0,
      low: 0,
      open: 0,
      lastUpdated: '',
      tradingStatus: 'closed',
    };
    await act(async () => {
      data = await result.current.getGDXETF(mockTileId, mockParams);
    });
    expect(data).toBeDefined();
    if (data) {
      expect(data.symbol).toBe('GDX');
      expect(data.currentPrice).toBe(30.5);
      expect(data.tradingStatus).toBe('open');
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    EndpointTestUtils.configureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      shouldFail: false,
      status: 500,
      responseData: { error: 'API error' },
    });
    const { result } = renderHook(() => useGdxEtfApi());
    await expect(result.current.getGDXETF(mockTileId, mockParams)).rejects.toThrow('API error');
  });

  it('returns empty data and error if fetch fails', async () => {
    EndpointTestUtils.configureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      shouldFail: true,
      errorType: 'network',
    });
    const { result } = renderHook(() => useGdxEtfApi());
    await expect(result.current.getGDXETF(mockTileId, mockParams)).rejects.toThrow(
      'Network error: Failed to fetch',
    );
  });
});
