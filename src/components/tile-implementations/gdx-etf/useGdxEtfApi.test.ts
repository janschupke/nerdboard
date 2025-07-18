import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGdxEtfApi } from './useGdxEtfApi';
import './dataMapper';
import { EndpointTestUtils } from '../../../test/utils/endpointTestUtils';
import { ALPHA_VANTAGE_GDX_ENDPOINT } from '../../../services/apiEndpoints';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks';

global.fetch = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider>{children}</MockDataServicesProvider>
);

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
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getGDXETF(mockTileId, mockParams);
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(typeof fetchResult.lastDataRequest).toBe('number');
      const data = fetchResult.data;
      expect(data).toBeDefined();
      if (data) {
        expect(data.symbol).toBe('GDX');
        expect(data.currentPrice).toBe(30.5);
        expect(data.tradingStatus).toBe('open');
      }
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    EndpointTestUtils.configureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      shouldFail: false,
      status: 500,
      responseData: { error: 'API error' },
    });
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    const fetchResult = await result.current.getGDXETF(mockTileId, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toEqual({
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
    });
  });

  it('returns empty data and error if fetch fails', async () => {
    EndpointTestUtils.configureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      shouldFail: true,
      errorType: 'network',
    });
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    const fetchResult = await result.current.getGDXETF(mockTileId, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toEqual({
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
    });
  });
});
