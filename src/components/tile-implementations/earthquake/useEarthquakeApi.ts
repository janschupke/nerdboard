import type { EarthquakeTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';

/**
 * Fetches recent earthquake data from the USGS API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for the USGS API (e.g., starttime, endtime, minmagnitude)
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<EarthquakeTileData[]>
 */
export function useEarthquakeApi() {
  const getEarthquakes = useCallback(
    async (
      tileId: string,
      params: Record<string, string | number>,
      forceRefresh = false,
    ): Promise<EarthquakeTileData[]> => {
      const url = buildApiUrl(USGS_EARTHQUAKE_ENDPOINT, { ...params, format: 'geojson' });
      const result = await DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EARTHQUAKE,
        { apiCall: TileApiCallTitle.EARTHQUAKE, forceRefresh },
      );
      if (result.error || !result.data || !Array.isArray(result.data))
        throw new Error(result.error || 'No data');
      return result.data as EarthquakeTileData[];
    },
    [],
  );
  return { getEarthquakes };
}
