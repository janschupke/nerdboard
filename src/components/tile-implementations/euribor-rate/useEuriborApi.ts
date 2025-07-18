import type { EuriborRateTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { EuriborParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useEuriborApi() {
  const { dataFetcher } = useDataServices();
  const getEuriborRate = useCallback(
    async (tileId: string, params: EuriborParams, forceRefresh = false): Promise<TileConfig<EuriborRateTileData>> => {
      const url = buildApiUrl(EMMI_EURIBOR_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EURIBOR_RATE,
        { apiCall: TileApiCallTitle.EURIBOR_RATE, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getEuriborRate };
}
