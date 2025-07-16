import type { UraniumApiResponse } from '../uranium/types';
import { DataFetcher } from '../../../services/dataFetcher';

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
    async (
      tileId: string,
      params: UraniumParams,
      forceRefresh = false,
    ): Promise<UraniumApiResponse> => {
      const url = buildApiUrl(TRADINGECONOMICS_URANIUM_ENDPOINT, params);
      const result = await DataFetcher.fetchWithRetry<UraniumApiResponse>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        {
          apiCall: 'TradingEconomics Uranium API',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as UraniumApiResponse;
    },
    [],
  );
  return { getUraniumPrice };
}
