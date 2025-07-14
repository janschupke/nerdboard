import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherData } from './useWeatherData';
import { WEATHER_ERROR_MESSAGES } from '../constants';

// Define the mock as a function declaration
function mockGetWeatherDataWithRetry(...args: unknown[]) {
  return mockGetWeatherDataWithRetry.fn(...args);
}
mockGetWeatherDataWithRetry.fn = vi.fn();

vi.mock('../services/weatherApi', () => ({
  weatherApiService: {
    getWeatherDataWithRetry: mockGetWeatherDataWithRetry,
  },
}));

describe('useWeatherData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWeatherDataWithRetry.fn.mockReset();
  });

  it('should fetch weather data successfully', async () => {
    const mockApiResponse = {
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

    mockGetWeatherDataWithRetry.fn.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useWeatherData('helsinki'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      city: 'helsinki',
      country: '',
      temperature: {
        current: 15.2,
        feels_like: 13.8,
        min: 12,
        max: 18,
      },
      conditions: {
        main: 'Clouds',
        description: 'scattered clouds',
        icon: '03d',
      },
      humidity: 65,
      wind: {
        speed: 12.5,
        direction: 180,
      },
      pressure: 1013,
      visibility: 10000,
      timestamp: expect.any(Number),
    });

    expect(result.current.forecast).toHaveLength(1);
    expect(result.current.error).toBe(null);
  });

  it.skip('should handle API errors', async () => {
    mockGetWeatherDataWithRetry.fn.mockRejectedValue(
      new Error(WEATHER_ERROR_MESSAGES.FETCH_FAILED),
    );

    const { result } = renderHook(() => useWeatherData('invalid-city'));

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(WEATHER_ERROR_MESSAGES.FETCH_FAILED);
    expect(result.current.data).toBe(null);
    expect(result.current.forecast).toEqual([]);
  });

  it('should refetch data when refetch is called', async () => {
    const mockApiResponse = {
      current: {
        temp: 20.0,
        feels_like: 18.5,
        humidity: 60,
        wind_speed: 10.0,
        wind_deg: 90,
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
      daily: [],
      timezone: 'Europe/Prague',
    };

    mockGetWeatherDataWithRetry.fn.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useWeatherData('prague'));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock to verify refetch
    mockGetWeatherDataWithRetry.fn.mockClear();

    // Call refetch
    await result.current.refetch();

    expect(mockGetWeatherDataWithRetry.fn).toHaveBeenCalledWith('prague');
  });

  it.skip('should use default refresh interval when not provided', async () => {
    renderHook(() => useWeatherData('helsinki'));

    expect(mockGetWeatherDataWithRetry.fn).toHaveBeenCalledWith('helsinki');
  });

  it.skip('should use custom refresh interval when provided', async () => {
    const customInterval = 60000; // 1 minute
    renderHook(() => useWeatherData('helsinki', customInterval));

    expect(mockGetWeatherDataWithRetry.fn).toHaveBeenCalledWith('helsinki');
  });
});
