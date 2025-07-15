import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFederalFundsApi } from './useFederalFundsApi';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupFederalFundsRateSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';
import type { FredApiResponse } from './types';

describe('useFederalFundsApi', () => {
  const mockTileId = 'test-federal-funds-tile';
  const mockParams: FredSeriesObservationsParams = {
    series_id: 'FEDFUNDS',
    file_type: 'json',
  };

  describe('getFederalFundsRate - Success Scenarios', () => {
    it('should successfully fetch federal funds rate data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());

      // Act
      const data = (await result.current.getFederalFundsRate(
        mockTileId,
        mockParams,
      )) as unknown as FredApiResponse;

      // Assert
      expect(data).toBeDefined();
      expect(data).toHaveProperty('observations');
      expect(data.observations).toHaveLength(2);
      expect(data.observations[0]).toHaveProperty('value', '5.50');
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(
        API_ENDPOINTS.FRED_SERIES_OBSERVATIONS,
        MockResponseData.getFederalFundsRateData(),
        50,
      );
      const { result } = renderHook(() => useFederalFundsApi());

      // Act & Assert
      await waitFor(async () => {
        const data = (await result.current.getFederalFundsRate(
          mockTileId,
          mockParams,
        )) as unknown as FredApiResponse;
        expect(data).toBeDefined();
        expect(data.observations).toHaveLength(2);
      });
    });
  });

  describe('getFederalFundsRate - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'network');
      const { result } = renderHook(() => useFederalFundsApi());

      // Act & Assert
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'timeout');
      const { result } = renderHook(() => useFederalFundsApi());

      // Act & Assert
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'api');
      const { result } = renderHook(() => useFederalFundsApi());

      // Act & Assert
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'malformed');
      const { result } = renderHook(() => useFederalFundsApi());

      // Act & Assert
      await expect(result.current.getFederalFundsRate(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getFederalFundsRate - Edge Cases', () => {
    it('should handle different series IDs', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());

      const testParams: FredSeriesObservationsParams[] = [
        { series_id: 'FEDFUNDS', file_type: 'json' },
        { series_id: 'DFF', file_type: 'json' },
        { series_id: 'EFFR', file_type: 'json' },
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = (await result.current.getFederalFundsRate(
          mockTileId,
          params,
        )) as unknown as FredApiResponse;
        expect(data).toBeDefined();
        expect(data.observations).toHaveLength(2);
      }
    });
  });

  describe('getFederalFundsRate - Data Validation', () => {
    it('should return properly structured federal funds rate data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi());

      // Act
      const data = (await result.current.getFederalFundsRate(
        mockTileId,
        mockParams,
      )) as unknown as FredApiResponse;

      // Assert
      expect(data).toMatchObject({
        observations: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: expect.any(String),
          }),
        ]),
      });

      expect(data.observations.length).toBeGreaterThan(0);

      // Verify observations have the expected structure
      data.observations.forEach((observation) => {
        expect(observation).toHaveProperty('date');
        expect(observation).toHaveProperty('value');
        expect(observation).toHaveProperty('realtime_start');
        expect(observation).toHaveProperty('realtime_end');
      });
    });
  });
});
