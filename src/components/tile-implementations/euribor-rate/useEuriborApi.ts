import type { EuriborRateTileData } from './types';
import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { EuriborParams } from '../../../services/apiEndpoints';

export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, params: EuriborParams, forceRefresh = false): Promise<FetchResult<EuriborRateTileData>> => {
      const url = buildApiUrl(EMMI_EURIBOR_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.EURIBOR_RATE,
        { apiCall: TileApiCallTitle.EURIBOR_RATE, forceRefresh },
      ) as Promise<FetchResult<EuriborRateTileData>>;
    },
    [],
  );
  return { getEuriborRate };
}
