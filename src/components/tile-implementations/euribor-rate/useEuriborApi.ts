import type { EuriborRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';

/**
 * Fetches Euribor rate data from the ECB API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<EuriborRateTileData>
 */
export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, forceRefresh = false): Promise<EuriborRateTileData> => {
      let response;
      try {
        response = await fetch('/api/ecb/data/euribor?format=json');
      } catch (err) {
        throw new Error((err as Error).message || 'Network error');
      }
      if (!response.ok) {
        throw new Error('ECB API error');
      }
      const result = await DataFetcher.fetchAndMap(
        async () => response.json(),
        tileId,
        'ecb-euribor',
        { forceRefresh }
      );
      if (result.error) throw new Error(result.error);
      return result.data as EuriborRateTileData;
    },
    [],
  );
  return { getEuriborRate };
}
