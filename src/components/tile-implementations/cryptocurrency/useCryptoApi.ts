import type { CryptocurrencyData } from '../cryptocurrency/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { COINGECKO_MARKETS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { CryptoMarketsParams } from '../../../services/apiEndpoints';
import type { CryptocurrencyTileData } from './types';

/**
 * Fetches cryptocurrency market data from CoinGecko.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for CoinGecko markets endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<CryptocurrencyData[]>
 */
export function useCryptoApi() {
  const getCryptocurrencyMarkets = useCallback(
    async (
      tileId: string,
      params: CryptoMarketsParams,
      forceRefresh = false,
    ): Promise<CryptocurrencyTileData> => {
      const url = buildApiUrl(COINGECKO_MARKETS_ENDPOINT, params);
      const result = await DataFetcher.fetchWithRetry<CryptocurrencyData[]>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        {
          apiCall: 'CoinGecko Markets API',
          forceRefresh,
        },
      );
      const tileData: CryptocurrencyTileData = {
        coins: result.data ?? [],
        lastUpdated: new Date().toISOString(),
      };
      if (result.error) throw new Error(result.error);
      return tileData;
    },
    [],
  );
  return { getCryptocurrencyMarkets };
}
