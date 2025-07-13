import { smartStorage } from './enhancedLocalStorage';

export interface FetchOptions {
  forceRefresh?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackToCache?: boolean;
}

export interface FetchResult<T> {
  data: T | null;
  isCached: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retryCount: number;
}

export class SmartDataFetcher {
  private static retryDelays = [1000, 2000, 5000, 10000]; // Exponential backoff

  static async fetchWithRetry<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    const {
      forceRefresh = false,
      retryCount = 0,
      timeout = 10000,
      fallbackToCache = true,
    } = options;

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = await smartStorage.getData<T>(storageKey);
        if (cached) {
          return {
            data: cached,
            isCached: true,
            error: null,
            lastUpdated: new Date(),
            retryCount: 0,
          };
        }
      }

      // Fetch fresh data with timeout
      const data = await this.fetchWithTimeout(fetchFunction, timeout);

      // Cache the fresh data
      await smartStorage.setData(storageKey, data);

      return {
        data,
        isCached: false,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Try to get cached data as fallback
      if (fallbackToCache) {
        const cached = await smartStorage.getData<T>(storageKey);
        if (cached) {
          return {
            data: cached,
            isCached: true,
            error: `Using cached data due to: ${errorMessage}`,
            lastUpdated: new Date(),
            retryCount: retryCount,
          };
        }
      }

      // Retry logic
      if (retryCount < this.retryDelays.length) {
        const delay = this.retryDelays[retryCount];

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.fetchWithRetry(fetchFunction, storageKey, {
          ...options,
          retryCount: retryCount + 1,
          retryDelay: delay,
        });
      }

      return {
        data: null,
        isCached: false,
        error: errorMessage,
        lastUpdated: null,
        retryCount: retryCount,
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
    const cached = await smartStorage.getData<T>(storageKey);

    if (cached) {
      // Schedule background refresh
      setTimeout(async () => {
        try {
          await this.fetchWithRetry(fetchFunction, storageKey, {
            ...options,
            forceRefresh: true,
            fallbackToCache: false, // Don't fallback during background refresh
          });
        } catch (error) {
          console.warn('Background refresh failed:', error);
        }
      }, 1000);

      return {
        data: cached,
        isCached: true,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    }

    // No cached data, fetch immediately
    return this.fetchWithRetry(fetchFunction, storageKey, options);
  }
} 
