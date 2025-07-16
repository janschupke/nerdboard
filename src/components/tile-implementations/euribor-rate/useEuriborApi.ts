import type { EuriborRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';

/**
 * Fetches Euribor rate data from EMMI.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for EMMI endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<EuriborRateTileData>
 */
export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, forceRefresh = false): Promise<EuriborRateTileData> => {
      // This endpoint is broken, so we'll return a mock error through dataFetcher
      // to ensure lastDataRequest gets updated properly
      const result = await DataFetcher.fetchWithRetry<EuriborRateTileData>(
        () => {
          throw new Error(
            'EMMI Euribor endpoint is currently broken (HTML-scraped, not a public JSON API)',
          );
        },
        tileId,
        {
          apiCall: 'EMMI Euribor Rate API',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as EuriborRateTileData;
    },
    [],
  );
  return { getEuriborRate };
}
