import type { WeatherApiResponse } from '../weather/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherParams } from '../../../services/apiEndpoints';

/**
 * Fetches weather data for a location from OpenWeatherMap.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for OpenWeatherMap endpoint
 * @returns Promise<WeatherApiResponse>
 */
export function useWeatherApi() {
  const getWeather = useCallback(
    async (tileId: string, params: WeatherParams): Promise<WeatherApiResponse> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<WeatherApiResponse>(
          () => fetch(url).then((res) => res.json()),
          tileId,
        );
        storageManager.setTileConfig(tileId, {
          data: result.data as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data as WeatherApiResponse;
      } catch (error) {
        storageManager.setTileConfig(tileId, {
          data: null,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: false,
        });
        throw error;
      }
    },
    [],
  );
  return { getWeather };
}
