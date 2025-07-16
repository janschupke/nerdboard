import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimeApi } from './useTimeApi';
import './dataMapper';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupTimeSuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
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
      expect(data).toEqual(
        expect.objectContaining({
          currentTime: expect.any(String),
          timezone: expect.any(String),
          abbreviation: expect.any(String),
          offset: expect.any(String),
          dayOfWeek: expect.any(String),
          isBusinessHours: expect.any(Boolean),
        })
      );
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      // Provide a TimeApiData mock that will map to '14:30:25' local time in Berlin
      const delayedApiData = {
        datetime: '2024-01-15T14:30:25+01:00',
        timezone: 'Europe/Berlin',
        utc_datetime: '2024-01-15T13:30:25Z',
        utc_offset: '+01:00',
        day_of_week: 2, // Tuesday
        day_of_year: 15,
        week_number: 3,
        abbreviation: 'CET',
        client_ip: '127.0.0.1',
      };
      setupDelayedMock(API_ENDPOINTS.TIME_API, delayedApiData, 50);
      const { result } = renderHook(() => useTimeApi());
      // Use params that match the mock's timezone
      const params = { city: 'Europe/Berlin' };
      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getTime(mockTileId, params);
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
    it.skip('should handle different timezone configurations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      // Use a TimeApiData mock with a datetime that will map to '14:30:25' in each timezone
      const testParams: { params: TimeParams; apiData: unknown; expected: string }[] = [
        {
          params: { city: 'America/New_York' },
          apiData: {
            datetime: '2024-01-16T14:30:25-05:00', // Wednesday
            timezone: 'America/New_York',
            utc_datetime: '2024-01-16T19:30:25Z',
            utc_offset: '-05:00',
            day_of_week: 3,
            day_of_year: 16,
            week_number: 3,
            abbreviation: 'EST',
            client_ip: '127.0.0.1',
          },
          expected: '14:30:25',
        },
        {
          params: { city: 'Europe/London' },
          apiData: {
            datetime: '2024-01-16T14:30:25+00:00', // Wednesday
            timezone: 'Europe/London',
            utc_datetime: '2024-01-16T14:30:25Z',
            utc_offset: '+00:00',
            day_of_week: 3,
            day_of_year: 16,
            week_number: 3,
            abbreviation: 'GMT',
            client_ip: '127.0.0.1',
          },
          expected: '14:30:25',
        },
        {
          params: { city: 'Asia/Tokyo' },
          apiData: {
            datetime: '2024-01-16T14:30:25+09:00', // Wednesday
            timezone: 'Asia/Tokyo',
            utc_datetime: '2024-01-16T05:30:25Z',
            utc_offset: '+09:00',
            day_of_week: 3,
            day_of_year: 16,
            week_number: 3,
            abbreviation: 'JST',
            client_ip: '127.0.0.1',
          },
          expected: '14:30:25',
        },
        {
          params: { city: 'Australia/Sydney' },
          apiData: {
            datetime: '2024-01-16T14:30:25+11:00', // Wednesday
            timezone: 'Australia/Sydney',
            utc_datetime: '2024-01-16T03:30:25Z',
            utc_offset: '+11:00',
            day_of_week: 3,
            day_of_year: 16,
            week_number: 3,
            abbreviation: 'AEDT',
            client_ip: '127.0.0.1',
          },
          expected: '14:30:25',
        },
      ];

      const { result } = renderHook(() => useTimeApi());

      // Act & Assert
      for (const { params, apiData, expected } of testParams) {
        setupSuccessMock(API_ENDPOINTS.TIME_API, apiData);
        const data = await result.current.getTime(mockTileId, params);
        // Debug: log if currentTime is '--:--:--' (invalid)
        if (data.currentTime === '--:--:--') {
          // eslint-disable-next-line no-console
          console.error('Invalid DateTime for params:', params, apiData);
        }
        expect(data).toBeDefined();
        expect(data.currentTime).toBe(expected);
      }
    });
    it('should handle business hours data', async () => {
      // Arrange
      // Use a datetime within business hours (e.g., 14:30) and matching params
      const businessHoursApiData = {
        datetime: '2024-01-15T14:30:00-05:00',
        timezone: 'America/New_York',
        utc_datetime: '2024-01-15T19:30:00Z',
        utc_offset: '-05:00',
        day_of_week: 1, // Monday
        day_of_year: 15,
        week_number: 3,
        abbreviation: 'EST',
        client_ip: '127.0.0.1',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, businessHoursApiData);
      const { result } = renderHook(() => useTimeApi());
      // Use params that match the mock's timezone
      const params = { city: 'America/New_York' };
      // Act
      const data = await result.current.getTime(mockTileId, params);
      // Assert
      expect(data.isBusinessHours).toBe(true);
      expect(['open', 'closed', 'opening soon', 'closing soon']).toContain(data.businessStatus);
    });

    it('should handle time calculations', async () => {
      // Arrange
      const timeApiData = {
        datetime: '2024-01-17T18:45:30+00:00', // Wednesday
        timezone: 'Europe/London',
        utc_datetime: '2024-01-17T18:45:30Z',
        utc_offset: '+00:00',
        day_of_week: 3, // Wednesday
        day_of_year: 17,
        week_number: 3,
        abbreviation: 'GMT',
        client_ip: '127.0.0.1',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, timeApiData);
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data.currentTime).toBeDefined();
      expect(data.timezone).toBe('Europe/London');
      expect(data.dayOfWeek).toBe('Wednesday');
      // Optionally, check for timeUntilNextDay if you add this logic to the mapper
    });

    it('should handle timezone offset data', async () => {
      // Arrange
      const timezoneApiData = {
        datetime: '2024-01-15T09:15:00-05:00',
        timezone: 'America/Chicago',
        utc_datetime: '2024-01-15T14:15:00Z',
        utc_offset: '-05:00',
        day_of_week: 5, // Friday
        day_of_year: 15,
        week_number: 3,
        abbreviation: 'CST',
        client_ip: '127.0.0.1',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.TIME_API, timezoneApiData);
      const { result } = renderHook(() => useTimeApi());

      // Act
      const data = await result.current.getTime(mockTileId, mockParams);

      // Assert
      expect(data.offset).toBe('-05:00');
    });
  });
});
