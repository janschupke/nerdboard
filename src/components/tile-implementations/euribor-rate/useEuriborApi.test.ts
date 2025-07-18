import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEuriborApi } from './useEuriborApi';
import './dataMapper';
import { setupEuriborRateSuccessMock } from '../../../test/utils/endpointTestUtils';
import { EndpointTestUtils, API_ENDPOINTS } from '../../../test/utils/endpointTestUtils';
import type { EuriborRateTileData } from './types';
import type { FetchResult } from '../../../services/dataFetcher';

describe('useEuriborApi', () => {
  const mockTileId = 'test-euribor-tile';
  const mockParams = {};

  beforeEach(() => {
    vi.clearAllMocks();
    // registerEcbEuriborDataMapper(); // This line is removed as per the new_code
    setupEuriborRateSuccessMock();
  });

  it('fetches and maps ECB Euribor data successfully', async () => {
    const { result } = renderHook(() => useEuriborApi());
    let fetchResult!: FetchResult<EuriborRateTileData>;
    await act(async () => {
      fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
    });
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('lastUpdated');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult).toHaveProperty('isCached');
    expect(fetchResult).toHaveProperty('retryCount');
    
    const data = fetchResult.data;
    expect(data).toBeDefined();
    if (data) {
      expect(typeof data.currentRate).toBe('number');
      expect(Array.isArray(data.historicalData)).toBe(true);
      expect(data.lastUpdate).toBeInstanceOf(Date);
    }
  });

  // Error cases can still use direct fetch mocking if needed
  it('throws error if API returns not ok', async () => {
    EndpointTestUtils.configureMock(API_ENDPOINTS.EMMI_EURIBOR, {
      shouldFail: false,
      status: 500,
      responseData: { error: 'API error' },
    });
    const { result } = renderHook(() => useEuriborApi());
    const fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
    expect(fetchResult.status).toBe('error');
    expect(fetchResult.error).toContain('API error');
  });

  it('throws error if fetch fails', async () => {
    EndpointTestUtils.configureMock(API_ENDPOINTS.EMMI_EURIBOR, {
      shouldFail: true,
      errorType: 'network',
    });
    const { result } = renderHook(() => useEuriborApi());
    const fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
    expect(fetchResult.status).toBe('error');
    expect(fetchResult.error).toContain('Network error');
  });
});
