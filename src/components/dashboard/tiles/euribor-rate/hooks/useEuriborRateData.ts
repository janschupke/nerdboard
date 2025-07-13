import { useState, useEffect, useCallback, useMemo } from 'react';
import { EuriborRateApiService } from '../services/euriborRateApi';
import { EURIBOR_RATE_UI_CONFIG } from '../constants';
import type { EuriborRateData, TimeRange } from '../types';
import { getCachedData, setCachedData } from '../../../../../utils/localStorage';
import { STORAGE_KEYS } from '../../../../../utils/constants';

const apiService = new EuriborRateApiService();

export const useEuriborRateData = () => {
  const [data, setData] = useState<EuriborRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(EURIBOR_RATE_UI_CONFIG.DEFAULT_TIME_RANGE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(
    () => `${STORAGE_KEYS.TILE_DATA_PREFIX}euribor-rate-${timeRange}`,
    [timeRange],
  );

  const loadData = useCallback(
    async (range: TimeRange, forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<EuriborRateData>(storageKey);
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        const result = await apiService.getEuriborRateData(range);
        setData(result);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        setCachedData(storageKey, result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load Euribor rate data';
        setError(errorMessage);
        console.error('Euribor rate data loading error:', err);
      } finally {
        setLoading(false);
      }
    },
    [storageKey],
  );

  const handleTimeRangeChange = useCallback(
    (newTimeRange: TimeRange) => {
      setTimeRange(newTimeRange);
      loadData(newTimeRange);
    },
    [loadData],
  );

  const refreshData = useCallback(() => {
    loadData(timeRange, true);
  }, [loadData, timeRange]);

  // Initial data load
  useEffect(() => {
    loadData(timeRange);
  }, [loadData, timeRange]);

  // Simplified auto-refresh every 24 hours
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (data && lastUpdated) {
        const hoursSinceLastRefresh = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastRefresh >= 24) {
          refreshData();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [data, lastUpdated, refreshData]);

  return {
    data,
    loading,
    error,
    timeRange,
    lastUpdated,
    isCached,
    setTimeRange: handleTimeRangeChange,
    refreshData,
    isLoading: loading,
    hasError: !!error,
    hasData: !!data,
  };
};
