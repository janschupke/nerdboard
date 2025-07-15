import { BaseDataMapper } from '../../../services/dataMapper';
import type { WeatherData, WeatherApiResponse } from './types';

export class WeatherDataMapper extends BaseDataMapper<WeatherApiResponse, WeatherData> {
  map(apiResponse: WeatherApiResponse): WeatherData {
    const current = apiResponse.current;
    const weather = current.weather[0];

    return {
      city: 'Helsinki', // Default city, could be configurable
      country: 'Finland',
      temperature: {
        current: current.temp,
        feels_like: current.feels_like,
        min: 0, // Not available in current API response
        max: 0, // Not available in current API response
      },
      conditions: {
        main: weather.main,
        description: weather.description,
        icon: weather.icon,
      },
      humidity: current.humidity,
      wind: {
        speed: current.wind_speed,
        direction: current.wind_deg,
      },
      pressure: current.pressure,
      visibility: current.visibility,
      timestamp: current.dt * 1000, // Convert to milliseconds
    };
  }

  validate(apiResponse: unknown): apiResponse is WeatherApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    if (!response.current || typeof response.current !== 'object') {
      return false;
    }

    const current = response.current as Record<string, unknown>;

    // Check required current fields
    const requiredCurrentFields = [
      'temp',
      'feels_like',
      'humidity',
      'wind_speed',
      'wind_deg',
      'pressure',
      'visibility',
      'weather',
      'dt',
    ];

    for (const field of requiredCurrentFields) {
      if (!(field in current)) {
        return false;
      }
    }

    // Validate weather array
    if (!Array.isArray(current.weather) || current.weather.length === 0) {
      return false;
    }

    const weather = current.weather[0] as Record<string, unknown>;
    const requiredWeatherFields = ['main', 'description', 'icon'];

    for (const field of requiredWeatherFields) {
      if (!(field in weather)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof current.temp === 'number' &&
      typeof current.feels_like === 'number' &&
      typeof current.humidity === 'number' &&
      typeof current.wind_speed === 'number' &&
      typeof current.wind_deg === 'number' &&
      typeof current.pressure === 'number' &&
      typeof current.visibility === 'number' &&
      typeof current.dt === 'number' &&
      typeof weather.main === 'string' &&
      typeof weather.description === 'string' &&
      typeof weather.icon === 'string'
    );
  }

  createDefault(): WeatherData {
    return {
      city: 'Helsinki',
      country: 'Finland',
      temperature: {
        current: 0,
        feels_like: 0,
        min: 0,
        max: 0,
      },
      conditions: {
        main: 'Unknown',
        description: 'No data available',
        icon: '01d',
      },
      humidity: 0,
      wind: {
        speed: 0,
        direction: 0,
      },
      pressure: 0,
      visibility: 0,
      timestamp: Date.now(),
    };
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('weather', new WeatherDataMapper());
