import type { TimeTileData, TimeApiResponse } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

/**
 * Fetches time data for a city from WorldTimeAPI.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for time endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<TimeTileData>
 */
export function useTimeApi() {
  const getTime = useCallback(
    async (tileId: string, params: TimeParams, forceRefresh = false): Promise<TimeTileData> => {
      const url = buildApiUrl(TIME_API_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap<
        (typeof TileType)['TIME_HELSINKI'],
        TimeApiResponse,
        TimeTileData
      >(() => fetch(url).then((res) => res.json()), tileId, TileType.TIME_HELSINKI, {
        apiCall: TileApiCallTitle.TIME,
        forceRefresh,
      });
      if (result.error) throw new Error(result.error);
      return result.data as TimeTileData;
    },
    [],
  );
  return { getTime };
}
