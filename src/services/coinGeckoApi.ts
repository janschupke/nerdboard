import type { CryptocurrencyData, PriceHistory } from '../types/cryptocurrency';
import { API_CONFIG } from '../utils/constants';

export class CoinGeckoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

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

    throw lastError || new Error('Request failed after all retries');
  }

  async getTopCryptocurrencies(limit: number = 10): Promise<CryptocurrencyData[]> {
    const cacheKey = `top-crypto-${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as CryptocurrencyData[];

    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      );

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from API');
      }

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch cryptocurrency data:', error);
      throw new Error(
        `Failed to fetch cryptocurrency data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getPriceHistory(coinId: string, days: number): Promise<PriceHistory[]> {
    const cacheKey = `price-history-${coinId}-${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached as PriceHistory[];

    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      );

      const data = await response.json();

      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error('Invalid price history response format');
      }

      const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      throw new Error(
        `Failed to fetch price history for ${coinId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
