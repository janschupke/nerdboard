import type { GdxEtfTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { ALPHA_VANTAGE_GDX_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType } from '../../../types/tile';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';

/**
 * Fetches GDX ETF data from Alpha Vantage API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for Alpha Vantage endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<GdxEtfTileData>
 */
export function useGdxEtfApi() {
  const getGDXETF = useCallback(
    async (
      tileId: string,
      params: AlphaVantageParams,
      forceRefresh = false,
    ): Promise<GdxEtfTileData> => {
      const url = buildApiUrl(ALPHA_VANTAGE_GDX_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap(
        async () => {
          const res = await fetch(url);
          if (!res.ok) {
            // Return a recognizable error object for DataFetcher
            return { error: 'API error', status: res.status };
          }
          return res.json();
        },
        tileId,
        TileType.GDX_ETF,
        { forceRefresh },
      );
      if (result.error) throw new Error(result.error);
      return result.data as GdxEtfTileData;
    },
    [],
  );
  return { getGDXETF };
}
