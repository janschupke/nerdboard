import type { PreciousMetalsApiResponseWithIndex } from './dataMapper';
import type { PreciousMetalsTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { PreciousMetalsParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

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
        (typeof TileType)['PRECIOUS_METALS'],
        PreciousMetalsApiResponseWithIndex,
        PreciousMetalsTileData
      >(() => fetch(url).then((res) => res.json()), tileId, TileType.PRECIOUS_METALS, {
        apiCall: TileApiCallTitle.PRECIOUS_METALS,
        forceRefresh,
      });
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data;
    },
    [],
  );
  return { getPreciousMetals };
}
