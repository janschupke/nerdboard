import type { UraniumApiResponse } from '../uranium/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { TRADINGECONOMICS_URANIUM_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UraniumParams } from '../../../services/apiEndpoints';

/**
 * Fetches uranium price data from TradingEconomics.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for uranium endpoint
 * @returns Promise<UraniumApiResponse>
 */
export function useUraniumApi() {
  const getUraniumPrice = useCallback(
    async (tileId: string, params: UraniumParams): Promise<UraniumApiResponse> => {
      const url = buildApiUrl(TRADINGECONOMICS_URANIUM_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<UraniumApiResponse>(
          () => fetch(url).then((res) => res.json()),
          tileId,
        );
        storageManager.setTileConfig(tileId, {
          data: result.data as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data as UraniumApiResponse;
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
  return { getUraniumPrice };
}
