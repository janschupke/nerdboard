import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUraniumApi } from './useUraniumApi';
import './dataMapper';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupUraniumSuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { UraniumParams } from '../../../services/apiEndpoints';

describe('useUraniumApi', () => {
  const mockTileId = 'test-uranium-tile';
  const mockParams: UraniumParams = {
    range: '1Y',
  };

  describe('getUraniumPrice - Success Scenarios', () => {
    it('should successfully fetch uranium data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupUraniumSuccessMock();
      const { result } = renderHook(() => useUraniumApi());

      // Act
      const data = await result.current.getUraniumPrice(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data).toHaveProperty('spotPrice');
      expect(data).toHaveProperty('change');
      expect(data).toHaveProperty('changePercent');
      expect(data).toHaveProperty('history');
      expect(data.spotPrice).toBe(85.5);
      expect(data.history).toHaveLength(2);
    });

    it('should handle empty history data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, {
        spotPrice: 85.5,
        history: [],
        change: 2.5,
        changePercent: 3.0,
      });
      const { result } = renderHook(() => useUraniumApi());

      // Act
      const data = await result.current.getUraniumPrice(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data.history).toEqual([]);
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(
        API_ENDPOINTS.TRADINGECONOMICS_URANIUM,
        MockResponseData.getUraniumData(),
        50,
      );
      const { result } = renderHook(() => useUraniumApi());

      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getUraniumPrice(mockTileId, mockParams);
        expect(data).toBeDefined();
        expect(data.spotPrice).toBe(85.5);
      });
    });
  });

  describe('getUraniumPrice - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, 'network');
      const { result } = renderHook(() => useUraniumApi());

      // Act & Assert
      await expect(result.current.getUraniumPrice(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, 'timeout');
      const { result } = renderHook(() => useUraniumApi());

      // Act & Assert
      await expect(result.current.getUraniumPrice(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, 'api');
      const { result } = renderHook(() => useUraniumApi());

      // Act & Assert
      await expect(result.current.getUraniumPrice(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TRADINGECONOMICS_URANIUM, 'malformed');
      const { result } = renderHook(() => useUraniumApi());

      // Act & Assert
      await expect(result.current.getUraniumPrice(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getUraniumPrice - Edge Cases', () => {
    it('should handle different range configurations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupUraniumSuccessMock();
      const { result } = renderHook(() => useUraniumApi());

      const testParams: UraniumParams[] = [
        { range: '1M' },
        { range: '3M' },
        { range: '6M' },
        { range: '1Y' },
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = await result.current.getUraniumPrice(mockTileId, params);
        expect(data).toBeDefined();
        expect(data.spotPrice).toBe(85.5);
      }
    });
  });

  describe('getUraniumPrice - Data Validation', () => {
    it('should return properly structured uranium data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupUraniumSuccessMock();
      const { result } = renderHook(() => useUraniumApi());

      // Act
      const data = await result.current.getUraniumPrice(mockTileId, mockParams);

      // Assert
      expect(data).toMatchObject({
        spotPrice: expect.any(Number),
        change: expect.any(Number),
        changePercent: expect.any(Number),
        history: expect.arrayContaining([
          expect.objectContaining({
            price: expect.any(Number),
            date: expect.any(String),
          }),
        ]),
        lastUpdated: expect.any(String),
        volume: expect.any(Number),
        supply: expect.any(Number),
        demand: expect.any(Number),
        marketStatus: expect.any(String),
      });

      expect(data.spotPrice).toBeGreaterThan(0);
      expect(data.history.length).toBeGreaterThan(0);

      // Verify history entries have the expected structure
      data.history.forEach((entry) => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('price');
        expect(entry.price).toBeGreaterThan(0);
      });
    });
  });
});
