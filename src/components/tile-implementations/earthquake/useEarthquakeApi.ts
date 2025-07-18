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
    async (
      tileId: string,
      params: Partial<Omit<UsgsEarthquakeParams, 'format' | 'starttime' | 'endtime'>> & {
        days?: number;
      },
      forceRefresh = false,
    ): Promise<TileConfig<EarthquakeTileDataArray>> => {
      // Calculate start/end time for the last N days (default 7)
      const days = params.days ?? 7;
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      const starttime = start.toISOString().slice(0, 10);
      const endtime = end.toISOString().slice(0, 10);
      const query: UsgsEarthquakeParams & { days?: number } = {
        format: 'geojson',
        starttime,
        endtime,
        ...params,
      };
      delete (query as Partial<UsgsEarthquakeParams> & { days?: number }).days;
      const url = buildApiUrl<UsgsEarthquakeParams>(USGS_EARTHQUAKE_ENDPOINT, query);
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
