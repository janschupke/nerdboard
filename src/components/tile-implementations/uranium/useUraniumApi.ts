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
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<UraniumApiResponse>
 */
export function useUraniumApi() {
  const getUraniumPrice = useCallback(
    async (tileId: string, params: UraniumParams, forceRefresh = false): Promise<UraniumApiResponse> => {
      const url = buildApiUrl(TRADINGECONOMICS_URANIUM_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<UraniumApiResponse>(
          () => fetch(url).then((res) => res.json()),
          tileId,
          { 
            apiCall: 'TradingEconomics Uranium API',
            forceRefresh,
          },
        );
        storageManager.setTileState<UraniumApiResponse>(tileId, {
          data: result.data as UraniumApiResponse,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data as UraniumApiResponse;
      } catch (error) {
        storageManager.setTileState<UraniumApiResponse>(tileId, {
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
