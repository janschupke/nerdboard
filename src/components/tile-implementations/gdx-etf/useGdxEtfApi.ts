import type { GdxEtfTileData } from './types';
import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { ALPHA_VANTAGE_GDX_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';

export function useGdxEtfApi() {
  const getGDXETF = useCallback(
    async (tileId: string, params: AlphaVantageParams, forceRefresh = false): Promise<FetchResult<GdxEtfTileData>> => {
      const url = buildApiUrl(ALPHA_VANTAGE_GDX_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.GDX_ETF,
        { apiCall: TileApiCallTitle.GDX_ETF, forceRefresh },
      ) as Promise<FetchResult<GdxEtfTileData>>;
    },
    [],
  );
  return { getGDXETF };
}
