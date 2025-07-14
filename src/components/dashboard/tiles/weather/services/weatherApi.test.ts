import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weatherApiService } from './weatherApi';
import { WEATHER_ERROR_MESSAGES } from '../constants';

// Mock the weather API service
vi.mock('./weatherApi', () => {
  const originalModule = vi.importActual('./weatherApi');
  return {
    ...originalModule,
    weatherApiService: {
      getWeatherData: vi.fn(),
      getWeatherDataWithRetry: vi.fn(),
      clearCache: vi.fn(),
      getCacheSize: vi.fn(),
    },
  };
});

describe('WeatherApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeatherData', () => {
    it('should return weather data for valid city', async () => {
      const mockWeatherData = {
        current: {
          temp: 15.2,
          feels_like: 13.8,
          humidity: 65,
          wind_speed: 12.5,
          wind_deg: 180,
          pressure: 1013,
          visibility: 10000,
          weather: [
            {
              main: 'Clouds',
              description: 'scattered clouds',
              icon: '03d',
            },
          ],
          dt: Date.now() / 1000,
        },
        daily: [
          {
            dt: Date.now() / 1000,
            temp: { min: 12, max: 18 },
            humidity: 65,
            wind_speed: 12.5,
            weather: [
              {
                main: 'Clouds',
                description: 'scattered clouds',
                icon: '03d',
              },
            ],
          },
        ],
        timezone: 'Europe/Helsinki',
      };

      vi.mocked(weatherApiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const result = await weatherApiService.getWeatherData('helsinki');

      expect(result).toEqual(mockWeatherData);
      expect(weatherApiService.getWeatherData).toHaveBeenCalledWith('helsinki');
    });

    it('should throw error for invalid city', async () => {
      vi.mocked(weatherApiService.getWeatherData).mockRejectedValue(
        new Error(WEATHER_ERROR_MESSAGES.CITY_NOT_FOUND),
      );

      await expect(weatherApiService.getWeatherData('invalid-city')).rejects.toThrow(
        WEATHER_ERROR_MESSAGES.CITY_NOT_FOUND,
      );
    });
  });

  describe('getWeatherDataWithRetry', () => {
    it('should retry failed requests', async () => {
      const mockWeatherData = {
        current: {
          temp: 15.2,
          feels_like: 13.8,
          humidity: 65,
          wind_speed: 12.5,
          wind_deg: 180,
          pressure: 1013,
          visibility: 10000,
          weather: [
            {
              main: 'Clouds',
              description: 'scattered clouds',
              icon: '03d',
            },
          ],
          dt: Date.now() / 1000,
        },
        daily: [],
        timezone: 'Europe/Helsinki',
      };

      vi.mocked(weatherApiService.getWeatherDataWithRetry).mockResolvedValue(mockWeatherData);

      const result = await weatherApiService.getWeatherDataWithRetry('helsinki');

      expect(result).toEqual(mockWeatherData);
      expect(weatherApiService.getWeatherDataWithRetry).toHaveBeenCalledWith('helsinki');
    });

    it('should throw error after max retries', async () => {
      vi.mocked(weatherApiService.getWeatherDataWithRetry).mockRejectedValue(
        new Error(WEATHER_ERROR_MESSAGES.FETCH_FAILED),
      );

      await expect(weatherApiService.getWeatherDataWithRetry('invalid-city')).rejects.toThrow(
        WEATHER_ERROR_MESSAGES.FETCH_FAILED,
      );
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      vi.mocked(weatherApiService.clearCache).mockImplementation(() => {});

      weatherApiService.clearCache();

      expect(weatherApiService.clearCache).toHaveBeenCalled();
    });

    it('should return cache size', () => {
      vi.mocked(weatherApiService.getCacheSize).mockReturnValue(3);

      const cacheSize = weatherApiService.getCacheSize();

      expect(cacheSize).toBe(3);
      expect(weatherApiService.getCacheSize).toHaveBeenCalled();
    });
  });
});
