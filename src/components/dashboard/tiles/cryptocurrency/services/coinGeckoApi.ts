import { CRYPTO_API_CONFIG, CRYPTO_ERROR_MESSAGES } from '../constants';
import type { CryptocurrencyData, PriceHistory } from '../types';
import { interceptAPIError } from '../../../../../services/apiErrorInterceptor';
import type { APIError } from '../../../../../services/apiErrorInterceptor';
import { storageManager } from '../../../../../services/storageManagerUtils';

export class CoinGeckoApiService {
  private baseUrl = CRYPTO_API_CONFIG.BASE_URL;

  async getTopCryptocurrencies(
    limit: number = CRYPTO_API_CONFIG.DEFAULT_LIMIT,
  ): Promise<CryptocurrencyData[]> {
    const cacheKey = `top-crypto-${limit}`;
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as CryptocurrencyData[]) : null;
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      );

      if (!response.ok) {
        const errorInfo: APIError = {
          apiCall: `${this.baseUrl}/coins/markets`,
          reason: `${CRYPTO_ERROR_MESSAGES.API_ERROR}: ${response.status}`,
          details: { status: response.status, limit },
        };
        interceptAPIError(errorInfo);
        throw new Error(`${CRYPTO_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
      }

      const data = await response.json();
      storageManager.setTileConfig(cacheKey, {
        data: data as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
      return data;
    } catch (error) {
      const errorInfo: APIError = {
        apiCall: `${this.baseUrl}/coins/markets`,
        reason: 'Failed to fetch cryptocurrency data',
        details: { error, limit },
      };
      interceptAPIError(errorInfo);
      throw error;
    }
  }

  async getPriceHistory(coinId: string, days: number): Promise<PriceHistory[]> {
    const cacheKey = `price-history-${coinId}-${days}`;
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as PriceHistory[]) : null;
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      );

      if (!response.ok) {
        const errorInfo: APIError = {
          apiCall: `${this.baseUrl}/coins/${coinId}/market_chart`,
          reason: `${CRYPTO_ERROR_MESSAGES.API_ERROR}: ${response.status}`,
          details: { status: response.status, coinId, days },
        };
        interceptAPIError(errorInfo);
        throw new Error(`${CRYPTO_ERROR_MESSAGES.API_ERROR}: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      storageManager.setTileConfig(cacheKey, {
        data: formattedData as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
      return formattedData;
    } catch (error) {
      const errorInfo: APIError = {
        apiCall: `${this.baseUrl}/coins/${coinId}/market_chart`,
        reason: 'Failed to fetch price history',
        details: { error, coinId, days },
      };
      interceptAPIError(errorInfo);
      throw error;
    }
  }
}
