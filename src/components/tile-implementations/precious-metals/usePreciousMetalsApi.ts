import type { PreciousMetalsApiDataWithIndex } from './dataMapper';
import type { PreciousMetalsTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { PreciousMetalsParams } from '../../../services/apiEndpoints';

/**
 * Fetches precious metals data (gold, silver).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for precious metals endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<PreciousMetalsTileData>
 */
export function usePreciousMetalsApi() {
  const getPreciousMetals = useCallback(
    async (
      tileId: string,
      params: PreciousMetalsParams,
      forceRefresh = false,
    ): Promise<PreciousMetalsTileData> => {
      const url = buildApiUrl(PRECIOUS_METALS_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap<
        'precious-metals',
        PreciousMetalsApiDataWithIndex,
        PreciousMetalsTileData
      >(() => fetch(url).then((res) => res.json()), tileId, 'precious-metals', { forceRefresh });
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data;
    },
    [],
  );
  return { getPreciousMetals };
}
