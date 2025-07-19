import type { TimeTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

export function useTimeApi() {
  const { dataFetcher } = useDataServices();
  const getTime = useCallback(
    async (
      tileId: string,
      params: TimeParams,
      forceRefresh = false,
    ): Promise<TileConfig<TimeTileData>> => {
      const url = buildApiUrl<TimeParams>(TIME_API_ENDPOINT, params);

      return dataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.TIME_HELSINKI,
        { apiCall: TileApiCallTitle.TIME, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getTime };
}
