import { useState, useEffect, useCallback } from 'react';
import { FederalFundsRateApiService } from '../services/federalFundsRateApi';
import { FEDERAL_FUNDS_ERROR_MESSAGES } from '../constants';
import type { FederalFundsRateData, TimeRange } from '../types';
import { getCachedData, setCachedData } from '../../../../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';

const apiService = new FederalFundsRateApiService();

export function useFederalFundsRateData(refreshInterval: number = REFRESH_INTERVALS.TILE_DATA) {
  const [data, setData] = useState<FederalFundsRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}federal-funds-rate-${timeRange}`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<FederalFundsRateData>(storageKey);
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        const result = await apiService.getFederalFundsRateData(timeRange);
        setData(result);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        setCachedData(storageKey, result);
      } catch (err) {
        setError(err instanceof Error ? err.message : FEDERAL_FUNDS_ERROR_MESSAGES.FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [timeRange, storageKey],
  );

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
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
    setTimeRange: updateTimeRange,
    refetch,
  };
}
