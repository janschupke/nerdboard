import { useState, useEffect, useCallback, useMemo } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import { PRECIOUS_METALS_API_CONFIG, PRECIOUS_METALS_ERROR_MESSAGES } from '../constants';
import { STORAGE_KEYS } from '../../../../../utils/constants';
import { SmartDataFetcher } from '../../../../../utils/smartDataFetcher';
import type { PreciousMetalsData } from '../types';

const apiService = new PreciousMetalsApiService();

export function usePreciousMetalsData(
  refreshInterval: number = PRECIOUS_METALS_API_CONFIG.DEFAULT_REFRESH_INTERVAL,
) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(() => `${STORAGE_KEYS.TILE_DATA_PREFIX}precious-metals`, []);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const result = await SmartDataFetcher.fetchWithBackgroundRefresh(
          () => apiService.getPreciousMetalsData(),
          storageKey,
          {
            forceRefresh,
          },
        );

        setData(result.data);
        setLastUpdated(result.lastUpdated);
        setIsCached(result.isCached);
        setRetryCount(result.retryCount);

        if (result.error && !result.isCached) {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED);
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
