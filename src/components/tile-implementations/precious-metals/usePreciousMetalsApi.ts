import type { PreciousMetalsTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import type { TileConfig } from '../../../services/storageManager';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { GoldApiParams } from '../../../services/apiEndpoints';

export function usePreciousMetalsApi() {
  const { dataFetcher } = useDataServices();
  const getPreciousMetals = useCallback(
    async (
      tileId: string,
      params: GoldApiParams,
      forceRefresh = false,
    ): Promise<TileConfig<PreciousMetalsTileData>> => {
      // Make a single API call that returns both gold and silver data
      const url = `/api/precious-metals?currency=${params.currency}&unit=${params.unit || 'ounce'}`;

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
