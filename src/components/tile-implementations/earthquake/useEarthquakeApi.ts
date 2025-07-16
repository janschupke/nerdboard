import type { EarthquakeTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';

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
      const query = new URLSearchParams({ format: 'geojson', ...params }).toString();
      const url = `/api/usgs/fdsnws/event/1/query?${query}`;
      let response;
      try {
        response = await fetch(url);
      } catch (err) {
        throw new Error((err as Error).message || 'Network error');
      }
      if (!response.ok) {
        throw new Error('USGS API error');
      }
      const result = await DataFetcher.fetchAndMap(
        async () => response.json(),
        tileId,
        'earthquake',
        { forceRefresh }
      );
      if (result.error || !result.data || !Array.isArray(result.data)) throw new Error(result.error || 'No data');
      return result.data as EarthquakeTileData[];
    },
    [],
  );
  return { getEarthquakes };
} 
