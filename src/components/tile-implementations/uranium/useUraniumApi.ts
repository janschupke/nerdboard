import type { UraniumApiDataWithIndex, UraniumTileData } from './dataMapper';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { TRADINGECONOMICS_URANIUM_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UraniumParams } from '../../../services/apiEndpoints';

/**
 * Fetches uranium price data from TradingEconomics.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for uranium endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<UraniumTileData>
 */
export function useUraniumApi() {
  const getUraniumPrice = useCallback(
    async (
      tileId: string,
      params: UraniumParams,
      forceRefresh = false,
    ): Promise<UraniumTileData> => {
      const url = buildApiUrl(TRADINGECONOMICS_URANIUM_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap<'uranium', UraniumApiDataWithIndex, UraniumTileData>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        'uranium',
        { forceRefresh },
      );
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data;
    },
    [],
  );
  return { getUraniumPrice };
}
