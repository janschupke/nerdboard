import { useState, useEffect, useCallback, useMemo } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import type { CryptocurrencyData } from '../types/cryptocurrency';
import { storageManager } from '../services/storageManagerUtils';
import { REFRESH_INTERVALS } from '../utils/constants';
import { interceptAPIError } from '../services/apiErrorInterceptor';
import type { APIError } from '../services/apiErrorInterceptor';

interface CryptocurrencyDataConfig {
  refreshInterval?: number;
}

export function useCryptocurrencyData(
  config: CryptocurrencyDataConfig = {},
  service?: CoinGeckoApiService,
) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const refreshInterval = config.refreshInterval ?? REFRESH_INTERVALS.TILE_DATA;

  // Memoize service instance to prevent recreation on every render
  const memoizedService = useMemo(() => service || new CoinGeckoApiService(), [service]);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const tileConfig = storageManager.getTileConfig('cryptocurrency-data');
          const cached =
            tileConfig && tileConfig.data
              ? (tileConfig.data as unknown as CryptocurrencyData[])
              : null;
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const result = await memoizedService.getTopCryptocurrencies(10);

        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('No cryptocurrency data received');
        }

        setData(result);
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
        setIsCached(false);
        // Cache the fresh data
        storageManager.setTileConfig('cryptocurrency-data', {
          data: result as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: true,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data';
        setError(errorMessage);

        const errorInfo: APIError = {
          apiCall: 'cryptocurrency-data',
          reason: 'Error fetching cryptocurrency data',
          details: { error: err },
        };
        interceptAPIError(errorInfo);

        // Increment retry count for potential retry logic
        setRetryCount((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    },
    [memoizedService],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    retryCount,
    lastUpdated,
    isCached,
    refetch,
  };
}
