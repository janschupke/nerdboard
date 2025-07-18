import type { EarthquakeTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UsgsEarthquakeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { TileConfig, TileDataType } from '../../../services/storageManager';

// Wrapper type for array
export interface EarthquakeTileDataArray extends TileDataType {
  items: EarthquakeTileData[];
}

export function useEarthquakeApi() {
  const { dataFetcher } = useDataServices();
  const getEarthquakes = useCallback(
    async (tileId: string, params: UsgsEarthquakeParams, forceRefresh = false): Promise<TileConfig<EarthquakeTileDataArray>> => {
      const url = buildApiUrl(USGS_EARTHQUAKE_ENDPOINT, params);
      // Map the array response to the wrapper type
      return dataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EARTHQUAKE,
        { apiCall: TileApiCallTitle.EARTHQUAKE, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getEarthquakes };
}
