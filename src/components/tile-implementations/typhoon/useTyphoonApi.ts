import type { TyphoonTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { CWB_TYPHOON_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import { useCallback } from 'react';

export function useTyphoonApi() {
  const getTyphoonData = useCallback(
    async (tileId: string, apiKey: string, forceRefresh = false) => {
      const params = { Authorization: apiKey, format: 'JSON' as const };
      const url = buildApiUrl(CWB_TYPHOON_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.TYPHOON,
        { apiCall: TileApiCallTitle.TYPHOON, forceRefresh },
      );
    },
    [],
  );
  return { getTyphoonData };
}
