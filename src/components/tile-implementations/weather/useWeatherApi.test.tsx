import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherApi } from './useWeatherApi';
import './dataMapper';
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
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { WeatherDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';

beforeAll(() => {
  // registerWeatherDataMapper(); // This line is removed as per the edit hint
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.WEATHER_HELSINKI, new WeatherDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('useWeatherApi', () => {
  const mockTileId = 'test-weather-tile';
  const mockParams: WeatherParams = {
    lat: 60.1699,
    lon: 24.9384,
  };

  describe('getWeather - Success Scenarios', () => {
    it('should successfully fetch weather data', async () => {
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi(), { wrapper });
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');

      const data = fetchResult.data;
      expect(data).toBeDefined();
      expect(data).toEqual(
        expect.objectContaining({
          city: expect.any(String),
          country: expect.any(String),
          temperature: expect.objectContaining({
            current: expect.any(Number),
            feels_like: expect.any(Number),
            min: expect.any(Number),
            max: expect.any(Number),
          }),
          conditions: expect.objectContaining({
            main: expect.any(String),
            description: expect.any(String),
            icon: expect.any(String),
          }),
          humidity: expect.any(Number),
          wind: expect.objectContaining({
            speed: expect.any(Number),
            direction: expect.any(Number),
          }),
          pressure: expect.any(Number),
          visibility: expect.any(Number),
          timestamp: expect.any(Number),
        }),
      );
    });

    it('should handle empty weather data', async () => {
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, {
        current: null,
        daily: [],
        timezone: 'Europe/Berlin',
      });
      const { result } = renderHook(() => useWeatherApi(), { wrapper });
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      const data = fetchResult.data;
      // Since the data mapper will return default values, check for those
      expect(data?.temperature?.current).toBe(0);
      expect(data?.conditions?.main).toBe('Unknown');
    });

    it('should handle delayed response', async () => {
      EndpointTestUtils.clearMocks();
      setupDelayedMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, MockResponseData.getWeatherData(), 50);
      const { result } = renderHook(() => useWeatherApi(), { wrapper });
      await waitFor(async () => {
        const fetchResult = await result.current.getWeather(mockTileId, mockParams);
        expect(fetchResult).toBeDefined();
        const data = fetchResult.data;
        expect(data).toBeDefined();
        expect(typeof data?.temperature?.current).toBe('number');
      });
    });
  });

  describe('getWeather - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'network');
      const { result } = renderHook(() => useWeatherApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual({
        city: 'Helsinki',
        country: 'Finland',
        temperature: { current: 0, feels_like: 0, min: 0, max: 0 },
        conditions: { main: 'Unknown', description: 'No data available', icon: '01d' },
        humidity: 0,
        wind: { speed: 0, direction: 0 },
        pressure: 0,
        visibility: 0,
        timestamp: expect.any(Number),
        daily: [],
      });
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'timeout');
      const { result } = renderHook(() => useWeatherApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual({
        city: 'Helsinki',
        country: 'Finland',
        temperature: { current: 0, feels_like: 0, min: 0, max: 0 },
        conditions: { main: 'Unknown', description: 'No data available', icon: '01d' },
        humidity: 0,
        wind: { speed: 0, direction: 0 },
        pressure: 0,
        visibility: 0,
        timestamp: expect.any(Number),
        daily: [],
      });
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'api');
      const { result } = renderHook(() => useWeatherApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual({
        city: 'Helsinki',
        country: 'Finland',
        temperature: { current: 0, feels_like: 0, min: 0, max: 0 },
        conditions: { main: 'Unknown', description: 'No data available', icon: '01d' },
        humidity: 0,
        wind: { speed: 0, direction: 0 },
        pressure: 0,
        visibility: 0,
        timestamp: expect.any(Number),
        daily: [],
      });
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.OPENWEATHERMAP_ONECALL, 'malformed');
      const { result } = renderHook(() => useWeatherApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual({
        city: 'Helsinki',
        country: 'Finland',
        temperature: { current: 0, feels_like: 0, min: 0, max: 0 },
        conditions: { main: 'Unknown', description: 'No data available', icon: '01d' },
        humidity: 0,
        wind: { speed: 0, direction: 0 },
        pressure: 0,
        visibility: 0,
        timestamp: expect.any(Number),
        daily: [],
      });
    });
  });

  describe('getWeather - Edge Cases', () => {
    it('should handle different coordinate combinations', async () => {
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi(), { wrapper });
      const testParams: WeatherParams[] = [{ lat: 52.52, lon: 13.405 }];
      for (const params of testParams) {
        const fetchResult = await result.current.getWeather(mockTileId, params);
        const data = fetchResult.data;
        expect(typeof data?.temperature?.current).toBe('number');
      }
    });
  });

  describe('getWeather - Data Validation', () => {
    it('should return properly structured weather data', async () => {
      EndpointTestUtils.clearMocks();
      setupWeatherSuccessMock();
      const { result } = renderHook(() => useWeatherApi(), { wrapper });
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      const data = fetchResult.data;
      expect(data).toEqual(
        expect.objectContaining({
          city: expect.any(String),
          country: expect.any(String),
          temperature: expect.objectContaining({
            current: expect.any(Number),
            feels_like: expect.any(Number),
            min: expect.any(Number),
            max: expect.any(Number),
          }),
          conditions: expect.objectContaining({
            main: expect.any(String),
            description: expect.any(String),
            icon: expect.any(String),
          }),
          humidity: expect.any(Number),
          wind: expect.objectContaining({
            speed: expect.any(Number),
            direction: expect.any(Number),
          }),
          pressure: expect.any(Number),
          visibility: expect.any(Number),
          timestamp: expect.any(Number),
        }),
      );
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
      const { result } = renderHook(() => useWeatherApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getWeather(mockTileId, mockParams);
      const data = fetchResult.data;

      // Assert
      expect(data?.temperature?.current).toBe(15.5);
      expect(data?.conditions?.main).toBe('Rain');
      expect(data?.daily?.[0]?.temperature?.min).toBe(8.0);
    });
  });
});
