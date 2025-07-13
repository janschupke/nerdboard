import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import { CRYPTO_API_CONFIG, CRYPTO_ERROR_MESSAGES } from '../constants';
import { REFRESH_INTERVALS, STORAGE_KEYS } from '../../../../../utils/constants';
import { SmartDataFetcher } from '../../../../../utils/smartDataFetcher';
import type { CryptocurrencyData } from '../types';

const apiService = new CoinGeckoApiService();

interface CryptocurrencyDataConfig {
  refreshInterval?: number;
}

export function useCryptocurrencyData(config: CryptocurrencyDataConfig = {}) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const refreshInterval = config.refreshInterval ?? REFRESH_INTERVALS.TILE_DATA;
  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}cryptocurrency`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const result = await SmartDataFetcher.fetchWithBackgroundRefresh(
          () => apiService.getTopCryptocurrencies(CRYPTO_API_CONFIG.DEFAULT_LIMIT),
          storageKey,
          {
            forceRefresh,
            fallbackToCache: true,
          },
        );

        setData(result.data || []);
        setLastUpdated(result.lastUpdated);
        setIsCached(result.isCached);
        setRetryCount(result.retryCount);

        if (result.error && !result.isCached) {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : CRYPTO_ERROR_MESSAGES.FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [storageKey],
  );

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchData(true);
    };

    const handleBackgroundRefresh = (event: CustomEvent) => {
      if (event.detail.key === storageKey) {
        fetchData(true);
      }
    };

    window.addEventListener('refresh-all-tiles', handleGlobalRefresh);
    window.addEventListener('background-refresh', handleBackgroundRefresh as EventListener);

    return () => {
      window.removeEventListener('refresh-all-tiles', handleGlobalRefresh);
      window.removeEventListener('background-refresh', handleBackgroundRefresh as EventListener);
    };
  }, [fetchData, storageKey]);

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
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isCached,
    retryCount,
    refetch,
  };
}
