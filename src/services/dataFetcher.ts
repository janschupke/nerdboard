import { storageManager } from './storageManager';

export interface FetchOptions {
  forceRefresh?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface FetchResult<T> {
  data: T | null;
  isCached: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retryCount: number;
}

export class DataFetcher {
  static async fetchWithRetry<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    const { forceRefresh = false, retryCount = 0, timeout = 10000 } = options;

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = storageManager.getTileConfig(storageKey);
        if (cached && cached.data) {
          return {
            data: cached.data as T,
            isCached: true,
            error: null,
            lastUpdated: new Date(cached.lastDataRequest),
            retryCount: 0,
          };
        }
      }

      // Fetch fresh data with timeout
      const data = await this.fetchWithTimeout(fetchFunction, timeout);

      // Cache the fresh data
      storageManager.setTileConfig(storageKey, {
        data: data as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });

      return {
        data,
        isCached: false,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    } catch (error) {
      return {
        data: null,
        isCached: false,
        error: error instanceof Error ? error.message : String(error),
        lastUpdated: new Date(),
        retryCount: retryCount + 1,
      };
    }
  }

  private static async fetchWithTimeout<T>(
    fetchFunction: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);

      fetchFunction()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  static async fetchWithBackgroundRefresh<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    // First, try to get cached data immediately
    const cached = storageManager.getTileConfig(storageKey);

    if (cached && cached.data) {
      // Schedule background refresh
      setTimeout(async () => {
        try {
          await this.fetchWithRetry(fetchFunction, storageKey, {
            ...options,
            forceRefresh: true,
          });
        } catch (error) {
          console.warn('Background refresh failed:', error);
        }
      }, 1000);

      return {
        data: cached.data as T,
        isCached: true,
        error: null,
        lastUpdated: new Date(cached.lastDataRequest),
        retryCount: 0,
      };
    }

    // No cached data, fetch immediately
    return this.fetchWithRetry(fetchFunction, storageKey, options);
  }
}
