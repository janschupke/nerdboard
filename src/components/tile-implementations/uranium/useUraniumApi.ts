import type { UraniumTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { URANIUM_HTML_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType } from '../../../types/tile';
import type { UraniumHtmlParams } from '../../../services/apiEndpoints';

/**
 * Fetches uranium price data from HTML using the unified dataFetcher and dataParser.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for uranium endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<UraniumTileData>
 */
export function useUraniumApi() {
  const getUraniumPrice = useCallback(
    async (
      tileId: string,
      params: UraniumHtmlParams,
      forceRefresh = false,
    ): Promise<UraniumTileData> => {
      const url = buildApiUrl(URANIUM_HTML_ENDPOINT, params);
      const result = await DataFetcher.fetchAndParse(
        async () => {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Uranium HTML fetch error');
          return res.text();
        },
        tileId,
        TileType.URANIUM,
        { forceRefresh },
      );
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data as UraniumTileData;
    },
    [],
  );
  return { getUraniumPrice };
}
