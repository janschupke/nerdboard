import type { WeatherApiResponse } from '../weather/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherTileData } from './types';
import type { WeatherParams } from '../../../services/apiEndpoints';

/**
 * Fetches weather data for a location from OpenWeatherMap.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for OpenWeatherMap endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<WeatherApiResponse>
 */
export function useWeatherApi() {
  const getWeather = useCallback(
    async (
      tileId: string,
      params: WeatherParams,
      forceRefresh = false,
    ): Promise<WeatherTileData> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      const result = await DataFetcher.fetchWithRetry<WeatherApiResponse>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        {
          apiCall: 'Weather API',
          forceRefresh,
        },
      );
      const tileData: WeatherTileData = {
        weather: result.data as WeatherApiResponse,
        lastUpdated: new Date().toISOString(),
      };
      if (result.error) throw new Error(result.error);
      return tileData;
    },
    [],
  );
  return { getWeather };
}
