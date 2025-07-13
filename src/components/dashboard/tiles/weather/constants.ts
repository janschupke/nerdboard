import { UI_CONFIG } from '../../../../utils/constants';

// API Configuration
export const WEATHER_API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  CACHE_DURATION: 300000, // 5 minutes
  DEFAULT_REFRESH_INTERVAL: 300000, // 5 minutes
  API_KEY: 'demo', // Will be replaced with actual API key
} as const;

// UI Configuration
export const WEATHER_UI_CONFIG = {
  CHART_HEIGHTS: UI_CONFIG.CHART_HEIGHTS,
  DEFAULT_REFRESH_INTERVAL: 300000, // 5 minutes
  FORECAST_DAYS: 5,
} as const;

// City Configurations
export const WEATHER_CITIES = {
  HELSINKI: {
    name: 'Helsinki',
    country: 'Finland',
    coordinates: { lat: 60.1699, lon: 24.9384 },
    timezone: 'Europe/Helsinki',
  },
  PRAGUE: {
    name: 'Prague',
    country: 'Czech Republic',
    coordinates: { lat: 50.0755, lon: 14.4378 },
    timezone: 'Europe/Prague',
  },
  TAIPEI: {
    name: 'Taipei',
    country: 'Taiwan',
    coordinates: { lat: 25.0330, lon: 121.5654 },
    timezone: 'Asia/Taipei',
  },
} as const;

// Weather Icons Mapping
export const WEATHER_ICONS = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '☁️', // few clouds night
  '03d': '☁️', // scattered clouds
  '03n': '☁️', // scattered clouds
  '04d': '☁️', // broken clouds
  '04n': '☁️', // broken clouds
  '09d': '🌧️', // shower rain
  '09n': '🌧️', // shower rain
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm
  '11n': '⛈️', // thunderstorm
  '13d': '❄️', // snow
  '13n': '❄️', // snow
  '50d': '🌫️', // mist
  '50n': '🌫️', // mist
} as const;

// Error Messages
export const WEATHER_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load weather data',
  API_ERROR: 'Weather API request failed',
  NETWORK_ERROR: 'Network error occurred',
  CITY_NOT_FOUND: 'City not found',
  INVALID_DATA: 'Invalid weather data received',
} as const;

// Temperature Conversion
export const TEMPERATURE_CONFIG = {
  KELVIN_OFFSET: 273.15,
  CELSIUS_SYMBOL: '°C',
  FAHRENHEIT_SYMBOL: '°F',
} as const; 
