import type { PreciousMetalsTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import type { TileConfig } from '../../../services/storageManager';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { GoldApiParams } from '../../../services/apiEndpoints';

export function usePreciousMetalsApi() {
  const { dataFetcher } = useDataServices();
  const getPreciousMetals = useCallback(
    async (
      tileId: string,
      params: GoldApiParams,
      forceRefresh = false,
    ): Promise<TileConfig<PreciousMetalsTileData>> => {
      const url = buildApiUrl<GoldApiParams>(PRECIOUS_METALS_ENDPOINT, params);

      return dataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.PRECIOUS_METALS,
        { apiCall: TileApiCallTitle.PRECIOUS_METALS, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getPreciousMetals };
}
