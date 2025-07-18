import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { COINGECKO_MARKETS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { CryptoMarketsParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { CryptocurrencyTileData } from './types';

export function useCryptoApi() {
  const getCryptocurrencyMarkets = useCallback(
    async (tileId: string, params: CryptoMarketsParams, forceRefresh = false): Promise<FetchResult<CryptocurrencyTileData>> => {
      const url = buildApiUrl(COINGECKO_MARKETS_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.CRYPTOCURRENCY,
        { apiCall: TileApiCallTitle.CRYPTOCURRENCY, forceRefresh },
      ) as Promise<FetchResult<CryptocurrencyTileData>>;
    },
    [],
  );
  return { getCryptocurrencyMarkets };
}
