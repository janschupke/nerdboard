import { storageManager } from './storageManager';

export interface FetchOptions {
  forceRefresh?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  apiCall?: string; // Add API call identifier for logging
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
    const { forceRefresh = false, retryCount = 0, timeout = 10000, apiCall = storageKey } = options;

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
      // Log error to api-log system
      const errorMessage = error instanceof Error ? error.message : String(error);
      storageManager.addLog({
        level: 'error',
        apiCall,
        reason: errorMessage,
        details: {
          storageKey,
          retryCount,
          forceRefresh,
          error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        },
      });

      return {
        data: null,
        isCached: false,
        error: errorMessage,
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
          // Log background refresh failures as warnings
          const errorMessage = error instanceof Error ? error.message : String(error);
          storageManager.addLog({
            level: 'warning',
            apiCall: options.apiCall || storageKey,
            reason: `Background refresh failed: ${errorMessage}`,
            details: {
              storageKey,
              error: error instanceof Error ? { name: error.name, message: error.message } : error,
            },
          });
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

  // Helper method to log warnings for non-critical issues
  static logWarning(apiCall: string, reason: string, details?: Record<string, unknown>): void {
    storageManager.addLog({
      level: 'warning',
      apiCall,
      reason,
      details,
    });
  }

  // Helper method to log errors for critical issues
  static logError(apiCall: string, reason: string, details?: Record<string, unknown>): void {
    storageManager.addLog({
      level: 'error',
      apiCall,
      reason,
      details,
    });
  }
}
