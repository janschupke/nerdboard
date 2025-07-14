import { WEATHER_API_CONFIG, WEATHER_ERROR_MESSAGES } from '../constants';
import type { WeatherApiResponse } from '../types';
import {
  interceptAPIError,
  interceptAPIWarning,
} from '../../../../../services/apiErrorInterceptor';
import type { APIError } from '../../../../../services/apiErrorInterceptor';

// Mock data for development and fallback
const MOCK_WEATHER_DATA: Record<string, WeatherApiResponse> = {
  helsinki: {
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
      {
        dt: (Date.now() + 86400000) / 1000,
        temp: { min: 10, max: 16 },
        humidity: 70,
        wind_speed: 15.2,
        weather: [
          {
            main: 'Rain',
            description: 'light rain',
            icon: '10d',
          },
        ],
      },
      {
        dt: (Date.now() + 172800000) / 1000,
        temp: { min: 8, max: 14 },
        humidity: 75,
        wind_speed: 18.1,
        weather: [
          {
            main: 'Rain',
            description: 'moderate rain',
            icon: '10d',
          },
        ],
      },
      {
        dt: (Date.now() + 259200000) / 1000,
        temp: { min: 11, max: 17 },
        humidity: 68,
        wind_speed: 14.3,
        weather: [
          {
            main: 'Clouds',
            description: 'broken clouds',
            icon: '04d',
          },
        ],
      },
      {
        dt: (Date.now() + 345600000) / 1000,
        temp: { min: 13, max: 19 },
        humidity: 62,
        wind_speed: 11.7,
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
      },
    ],
    timezone: 'Europe/Helsinki',
  },
  prague: {
    current: {
      temp: 18.7,
      feels_like: 17.2,
      humidity: 58,
      wind_speed: 8.9,
      wind_deg: 220,
      pressure: 1015,
      visibility: 10000,
      weather: [
        {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      dt: Date.now() / 1000,
    },
    daily: [
      {
        dt: Date.now() / 1000,
        temp: { min: 16, max: 22 },
        humidity: 58,
        wind_speed: 8.9,
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
      },
      {
        dt: (Date.now() + 86400000) / 1000,
        temp: { min: 14, max: 20 },
        humidity: 65,
        wind_speed: 12.1,
        weather: [
          {
            main: 'Clouds',
            description: 'few clouds',
            icon: '02d',
          },
        ],
      },
      {
        dt: (Date.now() + 172800000) / 1000,
        temp: { min: 12, max: 18 },
        humidity: 72,
        wind_speed: 15.8,
        weather: [
          {
            main: 'Rain',
            description: 'light rain',
            icon: '10d',
          },
        ],
      },
      {
        dt: (Date.now() + 259200000) / 1000,
        temp: { min: 15, max: 21 },
        humidity: 60,
        wind_speed: 10.4,
        weather: [
          {
            main: 'Clouds',
            description: 'scattered clouds',
            icon: '03d',
          },
        ],
      },
      {
        dt: (Date.now() + 345600000) / 1000,
        temp: { min: 17, max: 23 },
        humidity: 55,
        wind_speed: 9.2,
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
      },
    ],
    timezone: 'Europe/Prague',
  },
  taipei: {
    current: {
      temp: 25.3,
      feels_like: 27.8,
      humidity: 78,
      wind_speed: 6.2,
      wind_deg: 150,
      pressure: 1010,
      visibility: 8000,
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
        temp: { min: 23, max: 28 },
        humidity: 78,
        wind_speed: 6.2,
        weather: [
          {
            main: 'Clouds',
            description: 'scattered clouds',
            icon: '03d',
          },
        ],
      },
      {
        dt: (Date.now() + 86400000) / 1000,
        temp: { min: 22, max: 27 },
        humidity: 82,
        wind_speed: 8.5,
        weather: [
          {
            main: 'Rain',
            description: 'light rain',
            icon: '10d',
          },
        ],
      },
      {
        dt: (Date.now() + 172800000) / 1000,
        temp: { min: 21, max: 26 },
        humidity: 85,
        wind_speed: 12.3,
        weather: [
          {
            main: 'Rain',
            description: 'moderate rain',
            icon: '10d',
          },
        ],
      },
      {
        dt: (Date.now() + 259200000) / 1000,
        temp: { min: 24, max: 29 },
        humidity: 75,
        wind_speed: 7.1,
        weather: [
          {
            main: 'Clouds',
            description: 'broken clouds',
            icon: '04d',
          },
        ],
      },
      {
        dt: (Date.now() + 345600000) / 1000,
        temp: { min: 26, max: 31 },
        humidity: 70,
        wind_speed: 5.8,
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
      },
    ],
    timezone: 'Asia/Taipei',
  },
};

class WeatherApiService {
  private cache = new Map<string, { data: WeatherApiResponse; timestamp: number }>();

  private async fetchFromOpenWeatherMap(city: string): Promise<WeatherApiResponse> {
    const cityKey = city.toLowerCase();
    const cached = this.cache.get(cityKey);

    if (cached && Date.now() - cached.timestamp < WEATHER_API_CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    // For demo purposes, return mock data
    // In production, this would make actual API calls
    const mockData = MOCK_WEATHER_DATA[cityKey];
    if (mockData) {
      this.cache.set(cityKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    }

    throw new Error(WEATHER_ERROR_MESSAGES.CITY_NOT_FOUND);
  }

  private async fetchFromWeatherAPI(city: string): Promise<WeatherApiResponse> {
    // Fallback to WeatherAPI.com
    const cityKey = city.toLowerCase();
    const mockData = MOCK_WEATHER_DATA[cityKey];
    if (mockData) {
      return mockData;
    }
    throw new Error(WEATHER_ERROR_MESSAGES.API_ERROR);
  }

  private async fetchFromAccuWeather(city: string): Promise<WeatherApiResponse> {
    // Fallback to AccuWeather API
    const cityKey = city.toLowerCase();
    const mockData = MOCK_WEATHER_DATA[cityKey];
    if (mockData) {
      return mockData;
    }
    throw new Error(WEATHER_ERROR_MESSAGES.API_ERROR);
  }

  private async scrapeWeatherData(city: string): Promise<WeatherApiResponse> {
    // Web scraping fallback
    const cityKey = city.toLowerCase();
    const mockData = MOCK_WEATHER_DATA[cityKey];
    if (mockData) {
      return mockData;
    }
    throw new Error(WEATHER_ERROR_MESSAGES.NETWORK_ERROR);
  }

  async getWeatherData(city: string): Promise<WeatherApiResponse> {
    try {
      return await this.fetchFromOpenWeatherMap(city);
    } catch (error) {
      const warningInfo: APIError = {
        apiCall: 'OpenWeatherMap',
        reason: 'OpenWeatherMap failed, trying WeatherAPI.com',
        details: { error, city },
      };
      interceptAPIWarning(warningInfo);

      try {
        return await this.fetchFromWeatherAPI(city);
      } catch (error) {
        const warningInfo: APIError = {
          apiCall: 'WeatherAPI.com',
          reason: 'WeatherAPI.com failed, trying AccuWeather',
          details: { error, city },
        };
        interceptAPIWarning(warningInfo);

        try {
          return await this.fetchFromAccuWeather(city);
        } catch (error) {
          const warningInfo: APIError = {
            apiCall: 'AccuWeather',
            reason: 'AccuWeather failed, trying web scraping',
            details: { error, city },
          };
          interceptAPIWarning(warningInfo);

          try {
            return await this.scrapeWeatherData(city);
          } catch (error) {
            const errorInfo: APIError = {
              apiCall: 'All weather APIs',
              reason: 'All weather data sources failed',
              details: { error, city },
            };
            interceptAPIError(errorInfo);
            throw new Error(WEATHER_ERROR_MESSAGES.FETCH_FAILED);
          }
        }
      }
    }
  }

  async getWeatherDataWithRetry(city: string, maxRetries = 3): Promise<WeatherApiResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getWeatherData(city);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const weatherApiService = new WeatherApiService();
