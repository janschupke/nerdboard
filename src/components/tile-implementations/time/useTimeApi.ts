import type { TimeTileData, TimeApiResponse } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

export function useTimeApi() {
  const getTime = useCallback(
    async (tileId: string, params: TimeParams, forceRefresh = false) => {
      const url = buildApiUrl(TIME_API_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.TIME_HELSINKI,
        { apiCall: TileApiCallTitle.TIME, forceRefresh },
      );
    },
    [],
  );
  return { getTime };
}
