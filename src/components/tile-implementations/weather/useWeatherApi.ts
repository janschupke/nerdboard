import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { WeatherTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';

export function useWeatherApi() {
  const getWeather = useCallback(
    async (tileId: string, params: WeatherParams, forceRefresh = false): Promise<TileConfig<WeatherTileData>> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.WEATHER_HELSINKI,
        { apiCall: TileApiCallTitle.WEATHER, forceRefresh },
      );
    },
    [],
  );
  return { getWeather };
}
