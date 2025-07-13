import { useState, useEffect, useCallback } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import type { PreciousMetalsData } from '../types/preciousMetals';
import { getCachedData, setCachedData } from '../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../utils/constants';

export function usePreciousMetalsData(
  refreshInterval: number = REFRESH_INTERVALS.TILE_DATA,
  service: PreciousMetalsApiService = new PreciousMetalsApiService(),
) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}precious-metals`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<PreciousMetalsData>(storageKey);
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const result = await service.getPreciousMetalsData();

        // Validate the result
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid precious metals data received');
        }

        if (!result.gold || !result.silver) {
          throw new Error('Incomplete precious metals data received');
        }

        setData(result);
        setLastUpdated(new Date());
        setIsCached(false);
        setRetryCount(0); // Reset retry count on success

        // Cache the fresh data
        setCachedData(storageKey, result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch precious metals data';
        setError(errorMessage);

        // Increment retry count for potential retry logic
        setRetryCount((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    },
    [service, storageKey],
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
