import type { PreciousMetalsData } from '../precious-metals/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { PreciousMetalsParams } from '../../../services/apiEndpoints';

/**
 * Fetches precious metals data (gold, silver).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for precious metals endpoint
 * @returns Promise<PreciousMetalsData>
 */
export function usePreciousMetalsApi() {
  const getPreciousMetals = useCallback(
    async (tileId: string, params: PreciousMetalsParams): Promise<PreciousMetalsData> => {
      const url = buildApiUrl(PRECIOUS_METALS_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<PreciousMetalsData>(
          () => fetch(url).then((res) => res.json()),
          tileId,
          { apiCall: 'Precious Metals API' }
        );
        storageManager.setTileConfig(tileId, {
          data: result.data as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data as PreciousMetalsData;
      } catch (error) {
        storageManager.setTileConfig(tileId, {
          data: null,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: false,
        });
        throw error;
      }
    },
    [],
  );
  return { getPreciousMetals };
}
