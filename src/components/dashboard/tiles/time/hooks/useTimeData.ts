import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimezoneService } from '../services/timezoneService';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';
import { useStorageManager } from '../../../../../services/storageManagerUtils';
import type { TimeData } from '../types';

interface UseTimeDataReturn {
  timeData: TimeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isCached: boolean;
}

export const useTimeData = (
  city: 'helsinki' | 'prague' | 'taipei',
  refreshInterval: number = REFRESH_INTERVALS.COUNTDOWN_UPDATE,
): UseTimeDataReturn => {
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const storage = useStorageManager();

  const timezoneService = useMemo(() => TimezoneService.getInstance(), []);
  const cityConfig = useMemo(() => timezoneService.getCityConfig(city), [timezoneService, city]);

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(() => `${STORAGE_KEYS.TILE_DATA_PREFIX}time-${city}`, [city]);

  const fetchTimeData = useCallback(
    (forceRefresh = false) => {
      try {
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = storage.getTileConfig(storageKey);
          if (cached && cached.data) {
            setTimeData(cached.data as unknown as TimeData);
            setLastUpdated(new Date(cached.lastDataRequest));
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        const data = timezoneService.getTimeData(cityConfig);
        setTimeData(data);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        storage.setTileConfig(storageKey, {
          data: data as unknown as Record<string, unknown>,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: true,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [timezoneService, cityConfig, storageKey, storage],
  );

  // Initial fetch
  useEffect(() => {
    fetchTimeData();
  }, [fetchTimeData]);

  // Set up interval for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimeData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchTimeData, refreshInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchTimeData(true);
  }, [fetchTimeData]);

  return {
    timeData,
    loading,
    error,
    refetch,
    lastUpdated,
    isCached,
  };
};
