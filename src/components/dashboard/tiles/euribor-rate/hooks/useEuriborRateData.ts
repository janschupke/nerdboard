import { useState, useEffect, useCallback, useMemo } from 'react';
import { EuriborRateApiService } from '../services/euriborRateApi';
import { EURIBOR_RATE_UI_CONFIG } from '../constants';
import type { EuriborRateData, TimeRange } from '../types';
import { STORAGE_KEYS } from '../../../../../utils/constants';
import { useStorageManager } from '../../../../../services/storageManagerUtils';

const apiService = new EuriborRateApiService();
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export const useEuriborRateData = () => {
  const [data, setData] = useState<EuriborRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(EURIBOR_RATE_UI_CONFIG.DEFAULT_TIME_RANGE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const storage = useStorageManager();

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(
    () => `${STORAGE_KEYS.TILE_DATA_PREFIX}euribor-rate-${timeRange}`,
    [timeRange],
  );

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = storage.getTileConfig(storageKey);
          if (cached && cached.data) {
            setData(cached.data as unknown as EuriborRateData);
            setLastUpdated(new Date(cached.lastDataRequest));
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const result = await apiService.getEuriborRateData(timeRange);
        setData(result);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        storage.setTileConfig(storageKey, {
          data: result as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: true,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch euribor rate data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [storageKey, timeRange, storage],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    lastUpdated,
    isCached,
  };
};
