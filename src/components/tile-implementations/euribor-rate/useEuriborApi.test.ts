import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEuriborApi } from './useEuriborApi';
import { registerEcbEuriborDataMapper } from './dataMapper';
import { setupEuriborRateSuccessMock } from '../../../test/utils/endpointTestUtils';
import { EndpointTestUtils, API_ENDPOINTS } from '../../../test/utils/endpointTestUtils';


describe('useEuriborApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerEcbEuriborDataMapper();
    setupEuriborRateSuccessMock();
  });

  it('fetches and maps ECB Euribor data successfully', async () => {
    const { result } = renderHook(() => useEuriborApi());
    let data: Awaited<ReturnType<ReturnType<typeof useEuriborApi>["getEuriborRate"]>> | undefined;
    await act(async () => {
      data = await result.current.getEuriborRate('test-tile');
    });
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
    await expect(result.current.getEuriborRate('test-tile')).rejects.toThrow();
  });

  it('throws error if fetch fails', async () => {
    EndpointTestUtils.configureMock(API_ENDPOINTS.EMMI_EURIBOR, {
      shouldFail: true,
      errorType: 'network',
    });
    const { result } = renderHook(() => useEuriborApi());
    await expect(result.current.getEuriborRate('test-tile')).rejects.toThrow('Network error');
  });
});
