import { useState, useEffect, useCallback, useMemo } from 'react';
import { weatherApiService } from '../services/weatherApi';
import { WEATHER_UI_CONFIG, WEATHER_ERROR_MESSAGES } from '../constants';
import type { WeatherData, WeatherForecast, WeatherApiResponse } from '../types';

interface UseWeatherDataReturn {
  data: WeatherData | null;
  forecast: WeatherForecast[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdate: number | null;
}

export const useWeatherData = (
  city: string,
  refreshInterval: number = WEATHER_UI_CONFIG.DEFAULT_REFRESH_INTERVAL,
): UseWeatherDataReturn => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const transformApiResponse = useCallback((apiData: WeatherApiResponse, cityName: string): WeatherData => {
    const current = apiData.current;
    const weather = current.weather[0];

    return {
      city: cityName,
      country: '', // Will be set based on city
      temperature: {
        current: current.temp,
        feels_like: current.feels_like,
        min: 0, // Will be calculated from forecast
        max: 0, // Will be calculated from forecast
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
  }, []);

  const transformForecast = useCallback((apiData: WeatherApiResponse): WeatherForecast[] => {
    return apiData.daily.slice(0, WEATHER_UI_CONFIG.FORECAST_DAYS).map((day) => {
      const weather = day.weather[0];
      return {
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: {
          min: day.temp.min,
          max: day.temp.max,
        },
        conditions: {
          main: weather.main,
          description: weather.description,
          icon: weather.icon,
        },
        humidity: day.humidity,
        wind: {
          speed: day.wind_speed,
        },
      };
    });
  }, []);

  const fetchWeatherData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const apiData = await weatherApiService.getWeatherDataWithRetry(city);
      
      const weatherData = transformApiResponse(apiData, city);
      const forecastData = transformForecast(apiData);

      // Update min/max temperatures from forecast
      if (forecastData.length > 0) {
        const todayForecast = forecastData[0];
        weatherData.temperature.min = todayForecast.temperature.min;
        weatherData.temperature.max = todayForecast.temperature.max;
      }

      setData(weatherData);
      setForecast(forecastData);
      setLastUpdate(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : WEATHER_ERROR_MESSAGES.FETCH_FAILED;
      setError(errorMessage);
      console.error('Weather data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [city, transformApiResponse, transformForecast]);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchWeatherData();
  }, [fetchWeatherData]);

  // Initial data fetch
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchWeatherData();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchWeatherData, refreshInterval]);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo<UseWeatherDataReturn>(() => ({
    data,
    forecast,
    loading,
    error,
    refetch,
    lastUpdate,
  }), [data, forecast, loading, error, refetch, lastUpdate]);

  return returnValue;
}; 
