import type { EarthquakeTileData } from './types';
import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UsgsEarthquakeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

export function useEarthquakeApi() {
  const getEarthquakes = useCallback(
    async (tileId: string, params: UsgsEarthquakeParams, forceRefresh = false): Promise<FetchResult<EarthquakeTileData[]>> => {
      const url = buildApiUrl(USGS_EARTHQUAKE_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EARTHQUAKE,
        { apiCall: TileApiCallTitle.EARTHQUAKE, forceRefresh },
      ) as Promise<FetchResult<EarthquakeTileData[]>>;
    },
    [],
  );
  return { getEarthquakes };
}
