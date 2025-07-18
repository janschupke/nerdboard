import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEuriborApi } from './useEuriborApi';
import './dataMapper';
import { setupEuriborRateSuccessMock } from '../../../test/utils/endpointTestUtils';
import { EndpointTestUtils, API_ENDPOINTS } from '../../../test/utils/endpointTestUtils';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider>{children}</MockDataServicesProvider>
);

describe('useEuriborApi', () => {
  const mockTileId = 'test-euribor-tile';
  const mockParams = {};

  beforeEach(() => {
    vi.clearAllMocks();
    // registerEcbEuriborDataMapper(); // This line is removed as per the new_code
    setupEuriborRateSuccessMock();
  });

  it('fetches and maps ECB Euribor data successfully', async () => {
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
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
        expect(typeof data.currentRate).toBe('number');
        expect(Array.isArray(data.historicalData)).toBe(true);
        expect(data.lastUpdate).toBeInstanceOf(Date);
      }
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    EndpointTestUtils.configureMock(API_ENDPOINTS.EMMI_EURIBOR, {
      shouldFail: false,
      status: 500,
      responseData: { error: 'API error' },
    });
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    const fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toEqual({ currentRate: 0, lastUpdate: new Date(0), historicalData: [] });
  });

  it('returns empty data and error if fetch fails', async () => {
    EndpointTestUtils.configureMock(API_ENDPOINTS.EMMI_EURIBOR, {
      shouldFail: true,
      errorType: 'network',
    });
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    const fetchResult = await result.current.getEuriborRate(mockTileId, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toEqual({ currentRate: 0, lastUpdate: new Date(0), historicalData: [] });
  });
});
