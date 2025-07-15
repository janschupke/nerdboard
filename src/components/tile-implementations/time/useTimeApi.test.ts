import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimeApi } from './useTimeApi';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupTimeSuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { TimeParams } from '../../../services/apiEndpoints';

describe('useTimeApi', () => {
  const mockTileId = 'test-time-tile';
  const mockParams: TimeParams = {
    city: 'Europe/Berlin',
  };

  describe('getTime - Success Scenarios', () => {
    it('should successfully fetch time data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupTimeSuccessMock();
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data).toHaveProperty('currentTime');
      expect(data).toHaveProperty('timezone');
      expect(data).toHaveProperty('abbreviation');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('dayOfWeek');
      expect(data).toHaveProperty('isBusinessHours');
      expect(data.currentTime).toBe('14:30:25');
      expect(data.timezone).toBe('Europe/Berlin');
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(API_ENDPOINTS.TIME_API, MockResponseData.getTimeData(), 50);
      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getTime(mockTileId, mockParams);
        expect(data).toBeDefined();
        expect(data.currentTime).toBe('14:30:25');
      });
    });
  });

  describe('getTime - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'network');
      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      await expect(result.current.getTime(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'timeout');
      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      await expect(result.current.getTime(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'api');
      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      await expect(result.current.getTime(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'malformed');
      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      await expect(result.current.getTime(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getTime - Edge Cases', () => {
    it('should handle different timezone configurations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupTimeSuccessMock();
      const { result } = renderHook(() => useTimeApi());

      const testParams: TimeParams[] = [
        { city: 'America/New_York' },
        { city: 'Europe/London' },
        { city: 'Asia/Tokyo' },
        { city: 'Australia/Sydney' },
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = await result.current.getTime(mockTileId, params);
        expect(data).toBeDefined();
        expect(data.currentTime).toBe('14:30:25');
      }
    });
  });

  describe('getTime - Data Validation', () => {
    it('should return properly structured time data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupTimeSuccessMock();
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data).toMatchObject({
        currentTime: expect.any(String),
        timezone: expect.any(String),
        dayOfWeek: expect.any(String),
        isBusinessHours: expect.any(Boolean),
      });
    });

    it('should handle business hours data', async () => {
      // Arrange
      const businessHoursData = {
        currentTime: '14:30:00',
        timezone: 'America/New_York',
        dayOfWeek: 'Monday',
        isBusinessHours: true,
        businessStatus: 'closed' as const,
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, businessHoursData);
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data.isBusinessHours).toBe(true);
      expect(data.businessStatus).toBe('closed');
    });

    it('should handle time calculations', async () => {
      // Arrange
      const timeData = {
        currentTime: '18:45:30',
        timezone: 'Europe/London',
        dayOfWeek: 'Wednesday',
        isBusinessHours: false,
        timeUntilNextDay: '5h 30m 15s',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, timeData);
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data.timeUntilNextDay).toBe('5h 30m 15s');
    });

    it('should handle timezone offset data', async () => {
      // Arrange
      const timezoneData = {
        currentTime: '09:15:00',
        timezone: 'America/Chicago',
        dayOfWeek: 'Friday',
        isBusinessHours: true,
        offset: '-05:00',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, timezoneData);
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data.offset).toBe('-05:00');
    });
  });
});
