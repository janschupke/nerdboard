import type { UraniumTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { URANIUM_HTML_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UraniumHtmlParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';

export function useUraniumApi() {
  const getUraniumPrice = useCallback(
    async (tileId: string, params: UraniumHtmlParams, forceRefresh = false) => {
      const url = buildApiUrl(URANIUM_HTML_ENDPOINT, params);
      return DataFetcher.fetchAndParse(
        () => fetch(url).then((res) => res.text()),
        tileId,
        TileType.URANIUM,
        { apiCall: TileApiCallTitle.URANIUM, forceRefresh },
      );
    },
    [],
  );
  return { getUraniumPrice };
}
