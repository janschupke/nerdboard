import type { GDXETFData } from '../gdx-etf/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';

/**
 * Yahoo Finance endpoint is currently broken (proxy disabled).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for Yahoo Finance chart endpoint
 * @returns Promise<GDXETFData>
 */
export function useGdxEtfApi() {
  const getGDXETF = useCallback(
    async (tileId: string, forceRefresh = false): Promise<GDXETFData> => {
      // This endpoint is broken, so we'll return a mock error through dataFetcher
      // to ensure lastDataRequest gets updated properly
      const result = await DataFetcher.fetchWithRetry<GDXETFData>(
        () => {
          throw new Error('Yahoo Finance endpoint is currently broken (proxy disabled)');
        },
        tileId,
        {
          apiCall: 'Yahoo Finance Chart API',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as GDXETFData;
    },
    [],
  );
  return { getGDXETF };
}
