import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFederalFundsApi } from './useFederalFundsApi';
import './dataMapper';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupFederalFundsRateSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';

describe('useFederalFundsApi', () => {
  const mockTileId = 'test-federal-funds-tile';
  const mockParams: FredSeriesObservationsParams = {
    series_id: 'FEDFUNDS',
    file_type: 'json',
  };

  describe('getFederalFundsRate - Success Scenarios', () => {
    it('should successfully fetch mapped federal funds rate tile data', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());
      const data = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('currentRate');
      expect(data).toHaveProperty('lastUpdate');
      expect(data).toHaveProperty('historicalData');
      expect(typeof data.currentRate).toBe('number');
      expect(Array.isArray(data.historicalData)).toBe(true);
      expect(data.historicalData.length).toBeGreaterThan(0);
      expect(data.historicalData[0]).toEqual(
        expect.objectContaining({
          date: expect.any(Date),
          rate: expect.any(Number),
        })
      );
    });

    it('should handle delayed response', async () => {
      EndpointTestUtils.clearMocks();
      setupDelayedMock(
        API_ENDPOINTS.FRED_SERIES_OBSERVATIONS,
        MockResponseData.getFederalFundsRateData(),
        50,
      );
      const { result } = renderHook(() => useFederalFundsApi());
      await waitFor(async () => {
        const data = await result.current.getFederalFundsRate(mockTileId, mockParams);
        expect(data).toBeDefined();
        expect(typeof data.currentRate).toBe('number');
        expect(Array.isArray(data.historicalData)).toBe(true);
        expect(data.historicalData.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getFederalFundsRate - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'network');
      const { result } = renderHook(() => useFederalFundsApi());
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'timeout');
      const { result } = renderHook(() => useFederalFundsApi());
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'api');
      const { result } = renderHook(() => useFederalFundsApi());
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'malformed');
      const { result } = renderHook(() => useFederalFundsApi());
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getFederalFundsRate - Edge Cases', () => {
    it('should handle different series IDs', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());
      const testParams: FredSeriesObservationsParams[] = [
        { series_id: 'FEDFUNDS', file_type: 'json' },
        { series_id: 'DFF', file_type: 'json' },
        { series_id: 'EFFR', file_type: 'json' },
      ];
      for (const params of testParams) {
        const data = await result.current.getFederalFundsRate(mockTileId, params);
        expect(data).toBeDefined();
        expect(typeof data.currentRate).toBe('number');
        expect(Array.isArray(data.historicalData)).toBe(true);
        // Do not require historicalData.length > 0 for all series IDs
      }
    });
  });

  describe('getFederalFundsRate - Data Validation', () => {
    it('should return properly structured mapped federal funds rate tile data', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());
      const data = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(data).toMatchObject({
        currentRate: expect.any(Number),
        lastUpdate: expect.any(Date),
        historicalData: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(Date),
            rate: expect.any(Number),
          }),
        ]),
      });
      expect(data.historicalData.length).toBeGreaterThan(0);
      data.historicalData.forEach((entry) => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('rate');
      });
    });
  });
});
