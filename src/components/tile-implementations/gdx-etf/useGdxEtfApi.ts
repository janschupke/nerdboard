import type { GdxEtfTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';

/**
 * Fetches GDX ETF data from the Yahoo Finance API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<GdxEtfTileData>
 */
export function useGdxEtfApi() {
  const getGDXETF = useCallback(
    async (tileId: string, forceRefresh = false): Promise<GdxEtfTileData> => {
      let response;
      try {
        response = await fetch('/api/yahoo-finance/v8/finance/chart/GDX?interval=1d&range=1mo');
      } catch (err) {
        throw new Error((err as Error).message || 'Network error');
      }
      if (!response.ok) {
        throw new Error('Yahoo Finance API error');
      }
      const result = await DataFetcher.fetchAndMap(
        async () => response.json(),
        tileId,
        'gdx-etf',
        { forceRefresh }
      );
      if (result.error) throw new Error(result.error);
      return result.data as GdxEtfTileData;
    },
    [],
  );
  return { getGDXETF };
}
