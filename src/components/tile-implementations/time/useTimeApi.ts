import type { TimeTileData } from './types';
import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

export function useTimeApi() {
  const getTime = useCallback(
    async (tileId: string, params: TimeParams, forceRefresh = false): Promise<FetchResult<TimeTileData>> => {
      const url = buildApiUrl(TIME_API_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.TIME_HELSINKI,
        { apiCall: TileApiCallTitle.TIME, forceRefresh },
      ) as Promise<FetchResult<TimeTileData>>;
    },
    [],
  );
  return { getTime };
}
