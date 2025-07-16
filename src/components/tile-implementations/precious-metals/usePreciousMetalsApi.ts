import type { PreciousMetalsTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { METALS_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType } from '../../../types/tile';
import type { MetalsApiParams } from '../../../services/apiEndpoints';

/**
 * Fetches precious metals data from Metals-API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for Metals-API endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<PreciousMetalsTileData>
 */
export function usePreciousMetalsApi() {
  const getPreciousMetals = useCallback(
    async (
      tileId: string,
      params: MetalsApiParams,
      forceRefresh = false,
    ): Promise<PreciousMetalsTileData> => {
      const url = buildApiUrl(METALS_API_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap(
        async () => {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Metals-API error');
          return res.json();
        },
        tileId,
        TileType.PRECIOUS_METALS,
        { forceRefresh },
      );
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data as PreciousMetalsTileData;
    },
    [],
  );
  return { getPreciousMetals };
}
