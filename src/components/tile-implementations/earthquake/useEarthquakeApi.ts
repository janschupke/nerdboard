import type { EarthquakeTileData, EarthquakeApiResponse } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { EarthquakeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

export function useEarthquakeApi() {
  const getEarthquakes = useCallback(
    async (tileId: string, params: EarthquakeParams, forceRefresh = false) => {
      const url = buildApiUrl(USGS_EARTHQUAKE_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EARTHQUAKE,
        { apiCall: TileApiCallTitle.EARTHQUAKE, forceRefresh },
      );
    },
    [],
  );
  return { getEarthquakes };
}
