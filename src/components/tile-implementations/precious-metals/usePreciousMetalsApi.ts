import type { PreciousMetalsTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { METALS_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { MetalsApiParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

export function usePreciousMetalsApi() {
  const getPreciousMetals = useCallback(
    async (tileId: string, params: MetalsApiParams, forceRefresh = false): Promise<TileConfig<PreciousMetalsTileData>> => {
      const url = buildApiUrl(METALS_API_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.PRECIOUS_METALS,
        { apiCall: TileApiCallTitle.PRECIOUS_METALS, forceRefresh },
      );
    },
    [],
  );
  return { getPreciousMetals };
}
