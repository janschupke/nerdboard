import type { EuriborRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { EuriborParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, params: EuriborParams, forceRefresh = false): Promise<TileConfig<EuriborRateTileData>> => {
      const url = buildApiUrl(EMMI_EURIBOR_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EURIBOR_RATE,
        { apiCall: TileApiCallTitle.EURIBOR_RATE, forceRefresh },
      );
    },
    [],
  );
  return { getEuriborRate };
}
