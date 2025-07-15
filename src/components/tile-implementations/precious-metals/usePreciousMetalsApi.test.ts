import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupPreciousMetalsSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { PreciousMetalsParams } from '../../../services/apiEndpoints';

describe('usePreciousMetalsApi', () => {
  const mockTileId = 'test-precious-metals-tile';
  const mockParams: PreciousMetalsParams = {};

  describe('getPreciousMetals - Success Scenarios', () => {
    it('should successfully fetch precious metals data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupPreciousMetalsSuccessMock();
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act
      const data = await result.current.getPreciousMetals(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data).toHaveProperty('gold');
      expect(data).toHaveProperty('silver');
      expect(data.gold).toHaveProperty('price', 2050.75);
      expect(data.silver).toHaveProperty('price', 23.45);
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(API_ENDPOINTS.PRECIOUS_METALS, MockResponseData.getPreciousMetalsData(), 50);
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getPreciousMetals(mockTileId, mockParams);
        expect(data).toBeDefined();
        expect(data.gold).toHaveProperty('price', 2050.75);
      });
    });
  });

  describe('getPreciousMetals - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.PRECIOUS_METALS, 'network');
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act & Assert
      await expect(result.current.getPreciousMetals(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.PRECIOUS_METALS, 'timeout');
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act & Assert
      await expect(result.current.getPreciousMetals(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.PRECIOUS_METALS, 'api');
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act & Assert
      await expect(result.current.getPreciousMetals(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.PRECIOUS_METALS, 'malformed');
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act & Assert
      await expect(result.current.getPreciousMetals(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getPreciousMetals - Edge Cases', () => {
    it('should handle different API configurations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupPreciousMetalsSuccessMock();
      const { result } = renderHook(() => usePreciousMetalsApi());

      const testParams: PreciousMetalsParams[] = [
        { metals: ['gold', 'silver'] },
        { metals: ['gold'] },
        { metals: ['silver'] },
        { metals: ['gold', 'silver', 'platinum'] },
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = await result.current.getPreciousMetals(mockTileId, params);
        expect(data).toBeDefined();
        expect(data.gold).toHaveProperty('price', 2050.75);
      }
    });
  });

  describe('getPreciousMetals - Data Validation', () => {
    it('should return properly structured precious metals data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupPreciousMetalsSuccessMock();
      const { result } = renderHook(() => usePreciousMetalsApi());

      // Act
      const data = await result.current.getPreciousMetals(mockTileId, mockParams);

      // Assert
      expect(data).toMatchObject({
        gold: expect.objectContaining({
          price: expect.any(Number),
          change_24h: expect.any(Number),
          change_percentage_24h: expect.any(Number),
        }),
        silver: expect.objectContaining({
          price: expect.any(Number),
          change_24h: expect.any(Number),
          change_percentage_24h: expect.any(Number),
        }),
      });

      expect(data.gold.price).toBeGreaterThan(0);
      expect(data.silver.price).toBeGreaterThan(0);

      // Verify gold data structure
      expect(data.gold).toHaveProperty('price');
      expect(data.gold).toHaveProperty('change_24h');
      expect(data.gold).toHaveProperty('change_percentage_24h');

      // Verify silver data structure
      expect(data.silver).toHaveProperty('price');
      expect(data.silver).toHaveProperty('change_24h');
      expect(data.silver).toHaveProperty('change_percentage_24h');
    });
  });
});
