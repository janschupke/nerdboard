import type { CryptocurrencyData } from '../cryptocurrency/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { COINGECKO_MARKETS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { CryptoMarketsParams } from '../../../services/apiEndpoints';

/**
 * Fetches cryptocurrency market data from CoinGecko.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for CoinGecko markets endpoint
 * @returns Promise<CryptocurrencyData[]>
 */
export function useCryptoApi() {
  const getCryptocurrencyMarkets = useCallback(
    async (tileId: string, params: CryptoMarketsParams): Promise<CryptocurrencyData[]> => {
      const url = buildApiUrl(COINGECKO_MARKETS_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<CryptocurrencyData[]>(
          () => fetch(url).then((res) => res.json()),
          tileId,
          { apiCall: 'CoinGecko Markets API' }
        );
        storageManager.setTileConfig(tileId, {
          data: result.data as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data ?? [];
      } catch (error) {
        storageManager.setTileConfig(tileId, {
          data: null,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: false,
        });
        throw error;
      }
    },
    [],
  );
  return { getCryptocurrencyMarkets };
}
