import type { WeatherApiData } from '../weather/types';
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
 * @returns Promise<WeatherTileData>
 */
export function useWeatherApi() {
  const getWeather = useCallback(
    async (
      tileId: string,
      params: WeatherParams,
      forceRefresh = false,
    ): Promise<WeatherTileData> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap<'weather', WeatherApiData, WeatherTileData>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        'weather',
        {
          apiCall: 'Weather API',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as WeatherTileData;
    },
    [],
  );
  return { getWeather };
}
