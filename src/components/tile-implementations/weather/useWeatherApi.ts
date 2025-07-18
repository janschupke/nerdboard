import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { WeatherTileData } from './types';

export function useWeatherApi() {
  const getWeather = useCallback(
    async (tileId: string, params: WeatherParams, forceRefresh = false): Promise<FetchResult<WeatherTileData>> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.WEATHER_HELSINKI,
        { apiCall: TileApiCallTitle.WEATHER, forceRefresh },
      ) as Promise<FetchResult<WeatherTileData>>;
    },
    [],
  );
  return { getWeather };
}
