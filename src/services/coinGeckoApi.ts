import type { CryptocurrencyData, PriceHistory } from '../types/cryptocurrency';
import { API_CONFIG } from '../utils/constants';
import { interceptAPIError, interceptAPIWarning } from './apiErrorInterceptor';
import type { APIError } from './apiErrorInterceptor';
import { storageManager } from './storageManagerUtils';

export class CoinGeckoApiService {
  private baseUrl = '/api/coingecko/api/v3';

  private async makeRequest(
    url: string,
    retries: number = API_CONFIG.MAX_RETRIES,
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.DEFAULT_TIMEOUT);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit, wait and retry
            if (attempt < retries) {
              await new Promise((resolve) =>
                setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1)),
              );
              continue;
            }
          }
          const errorInfo: APIError = {
            apiCall: url,
            reason: `API request failed: ${response.status} ${response.statusText}`,
            details: { status: response.status, url },
          };
          interceptAPIError(errorInfo);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');

        if (attempt < retries && !(error instanceof Error && error.name === 'AbortError')) {
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1)),
          );
          continue;
        }
      }
    }

    if (lastError) {
      const errorInfo: APIError = {
        apiCall: url,
        reason: lastError.message,
        details: { error: lastError },
      };
      interceptAPIError(errorInfo);
    }
    throw lastError || new Error('Request failed after all retries');
  }

  async getTopCryptocurrencies(limit: number = 10): Promise<CryptocurrencyData[]> {
    const cacheKey = `top-crypto-${limit}`;
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as CryptocurrencyData[]) : null;
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      );

      const data = await response.json();

      if (!Array.isArray(data)) {
        const warningInfo: APIError = {
          apiCall: 'getTopCryptocurrencies',
          reason: 'Invalid response format from API',
          details: { data },
        };
        interceptAPIWarning(warningInfo);
        throw new Error('Invalid response format from API');
      }

      storageManager.setTileConfig(cacheKey, {
        data: data as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });
      return data;
    } catch (error) {
      const errorInfo: APIError = {
        apiCall: 'getTopCryptocurrencies',
        reason: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
      };
      interceptAPIError(errorInfo);
      throw new Error(
        `Failed to fetch cryptocurrency data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getPriceHistory(coinId: string, days: number): Promise<PriceHistory[]> {
    const cacheKey = `price-history-${coinId}-${days}`;
    const tileConfig = storageManager.getTileConfig(cacheKey);
    const cached =
      tileConfig && tileConfig.data ? (tileConfig.data as unknown as PriceHistory[]) : null;
    if (cached) return cached;

    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      );

      const data = await response.json();

      if (!data.prices || !Array.isArray(data.prices)) {
        const warningInfo: APIError = {
          apiCall: 'getPriceHistory',
          reason: 'Invalid price history response format',
          details: { data },
        };
        interceptAPIWarning(warningInfo);
        throw new Error('Invalid price history response format');
      }

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
        apiCall: 'getPriceHistory',
        reason: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
      };
      interceptAPIError(errorInfo);
      throw new Error(
        `Failed to fetch price history for ${coinId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
