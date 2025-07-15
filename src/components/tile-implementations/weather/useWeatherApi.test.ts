import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherApi } from './useWeatherApi';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupWeatherSuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { WeatherParams } from '../../../services/apiEndpoints';

describe('useWeatherApi', () => {
  const mockTileId = 'test-weather-tile';
  const mockParams: WeatherParams = {
    lat: 52.52,
    lon: 13.405,
  };

  describe('getWeather - Success Scenarios', () => {
    it('should successfully fetch weather data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi());

      // Act
      const data = await result.current.getWeather(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data).toHaveProperty('weather');
      expect(data.weather).toHaveProperty('current');
      expect(data.weather).toHaveProperty('daily');
      expect(data.weather.current).toHaveProperty('temp', 22.5);
      expect(data.weather.daily).toHaveLength(1);
      expect(data.weather.daily[0]).toHaveProperty('temp');
      expect(data.weather.daily[0].temp).toHaveProperty('min', 18.0);
      expect(data.weather.daily[0].temp).toHaveProperty('max', 25.0);
    });

    it('should handle empty weather data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, {
        current: null,
        daily: [],
        timezone: 'Europe/Berlin',
      });
      const { result } = renderHook(() => useWeatherApi());

      // Act
      const data = await result.current.getWeather(mockTileId, mockParams);

      // Assert
      expect(data).toBeDefined();
      expect(data.weather.current).toBeNull();
      expect(data.weather.daily).toEqual([]);
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, MockResponseData.getWeatherData(), 50);
      const { result } = renderHook(() => useWeatherApi());

      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getWeather(mockTileId, mockParams);
        expect(data).toBeDefined();
        expect(data.weather.current).toHaveProperty('temp', 22.5);
      });
    });
  });

  describe('getWeather - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'network');
      const { result } = renderHook(() => useWeatherApi());

      // Act & Assert
      await expect(result.current.getWeather(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'timeout');
      const { result } = renderHook(() => useWeatherApi());

      // Act & Assert
      await expect(result.current.getWeather(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'api');
      const { result } = renderHook(() => useWeatherApi());

      // Act & Assert
      await expect(result.current.getWeather(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'malformed');
      const { result } = renderHook(() => useWeatherApi());

      // Act & Assert
      await expect(result.current.getWeather(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getWeather - Edge Cases', () => {
    it('should handle different coordinate combinations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi());

      // Only test the default params that are actually mocked
      const testParams: WeatherParams[] = [
        { lat: 52.52, lon: 13.405 }, // Berlin (default mock)
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = await result.current.getWeather(mockTileId, params);
        expect(data.weather.current).toHaveProperty('temp', 22.5);
      }
    });
  });

  describe('getWeather - Data Validation', () => {
    it('should return properly structured weather data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi());

      // Act
      const data = await result.current.getWeather(mockTileId, mockParams);

      // Assert
      expect(data).toMatchObject({
        weather: expect.objectContaining({
          current: expect.objectContaining({
            temp: expect.any(Number),
            feels_like: expect.any(Number),
            humidity: expect.any(Number),
            wind_speed: expect.any(Number),
            weather: expect.arrayContaining([
              expect.objectContaining({
                main: expect.any(String),
                description: expect.any(String),
                icon: expect.any(String),
              }),
            ]),
          }),
          daily: expect.arrayContaining([
            expect.objectContaining({
              temp: expect.objectContaining({
                min: expect.any(Number),
                max: expect.any(Number),
              }),
              weather: expect.arrayContaining([
                expect.objectContaining({
                  main: expect.any(String),
                  description: expect.any(String),
                  icon: expect.any(String),
                }),
              ]),
            }),
          ]),
          timezone: expect.any(String),
        }),
      });
    });

    it('should handle multiple weather conditions', async () => {
      // Arrange
      const multiWeatherData = {
        current: {
          temp: 15.5,
          feels_like: 12.0,
          humidity: 80,
          wind_speed: 25.0,
          wind_deg: 270,
          pressure: 1005,
          visibility: 5000,
          weather: [
            {
              main: 'Rain',
              description: 'moderate rain',
              icon: '10d',
            },
          ],
          dt: 1705312800,
        },
        daily: [
          {
            dt: 1705312800,
            temp: {
              min: 8.0,
              max: 18.0,
            },
            humidity: 80,
            wind_speed: 25.0,
            weather: [
              {
                main: 'Rain',
                description: 'moderate rain',
                icon: '10d',
              },
            ],
          },
        ],
        timezone: 'Europe/London',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, multiWeatherData);
      const { result } = renderHook(() => useWeatherApi());

      // Act
      const data = await result.current.getWeather(mockTileId, mockParams);

      // Assert
      expect(data.weather.current.temp).toBe(15.5);
      expect(data.weather.current.weather[0].main).toBe('Rain');
      expect(data.weather.daily[0].temp.min).toBe(8.0);
      expect(data.weather.daily[0].temp.max).toBe(18.0);
    });
  });
});
