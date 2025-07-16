import {
  APILogLevel,
  storageManager,
  type APILogDetails,
  type TileDataType,
} from './storageManager';
import { type BaseApiResponse, DataMapperRegistry } from './dataMapper';

// 10-minute interval constant for data freshness
export const DATA_FRESHNESS_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

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
  // Centralized helper for setting tile state
  private static setTileState<T>(
    storageKey: string,
    data: T | null,
    lastDataRequestSuccessful: boolean,
  ) {
    storageManager.setTileState<T>(storageKey, {
      data,
      lastDataRequest: Date.now(),
      lastDataRequestSuccessful,
    });
  }

  static async fetchWithRetry<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    const { forceRefresh = false, retryCount = 0, timeout = 10000, apiCall = storageKey } = options;

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = storageManager.getTileState<T>(storageKey);
        if (cached) {
          // Check if data is fresh (less than 10 minutes old)
          const now = Date.now();
          const dataAge = now - cached.lastDataRequest;
          const isDataFresh = dataAge < DATA_FRESHNESS_INTERVAL;

          if (isDataFresh) {
            return {
              data: cached.data as T,
              isCached: true,
              error: cached.data ? null : 'No data (cached error or previous failure)',
              lastUpdated: new Date(cached.lastDataRequest),
              retryCount: 0,
            };
          }
          // Data is stale, continue to fetch fresh data
        }
      }

      // Fetch fresh data with timeout
      let data: T;
      try {
        data = await DataFetcher.fetchWithTimeout(fetchFunction, timeout);
      } catch (fetchError) {
        // Log fetch error (network, timeout, etc.)
        const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
        const logDetails: APILogDetails = {
          storageKey,
          retryCount,
          forceRefresh: forceRefresh ? 1 : 0,
          errorName: fetchError instanceof Error ? fetchError.name : 'Unknown',
          errorMessage,
        };
        storageManager.addLog({
          level: APILogLevel.ERROR,
          apiCall,
          reason: errorMessage,
          details: logDetails,
        });

        // Update lastDataRequest even on error to prevent infinite retry loops
        DataFetcher.setTileState<T>(storageKey, null, false);

        return {
          data: null,
          isCached: false,
          error: errorMessage,
          lastUpdated: new Date(),
          retryCount: retryCount + 1,
        };
      }

      // If data is an error response (e.g., 400/500), log it
      if (data && typeof data === 'object' && 'error' in data) {
        const errorVal = (data as Record<string, unknown>).error;
        const errorMessage = typeof errorVal === 'string' ? errorVal : 'API error';
        const logDetails: APILogDetails = {
          storageKey,
          retryCount,
          forceRefresh: forceRefresh ? 1 : 0,
          errorName: 'APIError',
          errorMessage,
        };
        storageManager.addLog({
          level: APILogLevel.ERROR,
          apiCall,
          reason: errorMessage,
          details: logDetails,
        });

        // Update lastDataRequest even on API error to prevent infinite retry loops
        DataFetcher.setTileState<T>(storageKey, null, false);

        return {
          data: null,
          isCached: false,
          error: errorMessage,
          lastUpdated: new Date(),
          retryCount: retryCount + 1,
        };
      }

      // Cache the fresh data
      DataFetcher.setTileState<T>(storageKey, data as unknown as T, true);

      return {
        data,
        isCached: false,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    } catch (error) {
      // Log error to api-log system with improved typing
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logDetails: APILogDetails = {
        storageKey,
        retryCount,
        forceRefresh: forceRefresh ? 1 : 0,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });

      // Update lastDataRequest even on general error to prevent infinite retry loops
      DataFetcher.setTileState<T>(storageKey, null, false);

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
    const cached = storageManager.getTileState<T>(storageKey);

    if (cached && cached.data) {
      // Schedule background refresh
      setTimeout(async () => {
        try {
          await DataFetcher.fetchWithRetry(fetchFunction, storageKey, {
            ...options,
            forceRefresh: true,
          });
        } catch (error) {
          // Log background refresh failures as warnings with improved typing
          const errorMessage = error instanceof Error ? error.message : String(error);
          const logDetails: APILogDetails = {
            storageKey,
            errorMessage,
          };

          storageManager.addLog({
            level: APILogLevel.WARNING,
            apiCall: options.apiCall || storageKey,
            reason: `Background refresh failed: ${errorMessage}`,
            details: logDetails,
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
    return DataFetcher.fetchWithRetry(fetchFunction, storageKey, options);
  }

  // Helper method to log warnings for non-critical issues
  static logWarning(apiCall: string, reason: string, details?: APILogDetails): void {
    storageManager.addLog({
      level: APILogLevel.WARNING,
      apiCall,
      reason,
      details,
    });
  }

  // Helper method to log errors for critical issues
  static logError(apiCall: string, reason: string, details?: APILogDetails): void {
    storageManager.addLog({
      level: APILogLevel.ERROR,
      apiCall,
      reason,
      details,
    });
  }

  // New method for fetching and mapping data with type safety
  static async fetchAndMap<
    TTileType extends string,
    TApiResponse extends BaseApiResponse,
    TTileData extends TileDataType,
  >(
    fetchFunction: () => Promise<TApiResponse>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = {},
  ): Promise<FetchResult<TTileData>> {
    const mapper = DataMapperRegistry.get<TTileType, TApiResponse, TTileData>(tileType);

    if (!mapper) {
      throw new Error(`No data mapper found for tile type: ${tileType}`);
    }

    try {
      const result = await DataFetcher.fetchWithRetry(fetchFunction, storageKey, options);

      if (result.data) {
        // Map the API response to tile content data
        const mappedData = mapper.safeMap(result.data);

        // Cache the mapped data
        DataFetcher.setTileState<TTileData>(storageKey, mappedData, true);

        return {
          data: mappedData,
          isCached: result.isCached,
          error: null,
          lastUpdated: result.lastUpdated,
          retryCount: result.retryCount,
        };
      } else {
        // Return default data if no API data
        const defaultData = mapper.createDefault();

        DataFetcher.setTileState<TTileData>(storageKey, defaultData, false);

        return {
          data: defaultData,
          isCached: false,
          error: result.error,
          lastUpdated: result.lastUpdated,
          retryCount: result.retryCount,
        };
      }
    } catch (error) {
      // Return default data on error
      const defaultData = mapper.createDefault();

      DataFetcher.setTileState<TTileData>(storageKey, defaultData, false);

      return {
        data: defaultData,
        isCached: false,
        error: error instanceof Error ? error.message : String(error),
        lastUpdated: new Date(),
        retryCount: 0,
      };
    }
  }
}
