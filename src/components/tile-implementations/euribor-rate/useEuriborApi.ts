import type { EuriborRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType } from '../../../types/tile';

/**
 * Fetches Euribor rate data from the ECB API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<EuriborRateTileData>
 */
export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, forceRefresh = false): Promise<EuriborRateTileData> => {
      const url = buildApiUrl(EMMI_EURIBOR_ENDPOINT, {});
      const result = await DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EURIBOR_RATE,
        { forceRefresh },
      );
      if (result.error) throw new Error(result.error);
      return result.data as EuriborRateTileData;
    },
    [],
  );
  return { getEuriborRate };
}
