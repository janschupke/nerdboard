import { useState, useEffect, useCallback, useMemo } from 'react';
import { FederalFundsRateApiService } from '../services/federalFundsRateApi';
import { FEDERAL_FUNDS_ERROR_MESSAGES } from '../constants';
import type { FederalFundsRateData, TimeRange } from '../types';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';
import { SmartDataFetcher } from '../../../../../utils/smartDataFetcher';

const apiService = new FederalFundsRateApiService();

export function useFederalFundsRateData(refreshInterval: number = REFRESH_INTERVALS.TILE_DATA) {
  const [data, setData] = useState<FederalFundsRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(
    () => `${STORAGE_KEYS.TILE_DATA_PREFIX}federal-funds-rate-${timeRange}`,
    [timeRange],
  );

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const result = await SmartDataFetcher.fetchWithBackgroundRefresh(
          () => apiService.getFederalFundsRateData(timeRange),
          storageKey,
          {
            forceRefresh,
            fallbackToCache: true,
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
        setError(err instanceof Error ? err.message : FEDERAL_FUNDS_ERROR_MESSAGES.FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [timeRange, storageKey],
  );

  // Listen for global refresh events with proper cleanup
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

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const updateTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  return {
    data,
    loading,
    error,
    timeRange,
    lastUpdated,
    isCached,
    retryCount,
    setTimeRange: updateTimeRange,
    refetch,
  };
}
