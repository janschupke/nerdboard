import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimezoneService } from '../services/timezoneService';
import type { TimeData } from '../types';
import { getCachedData, setCachedData } from '../../../../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';

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

  const timezoneService = useMemo(() => TimezoneService.getInstance(), []);
  const cityConfig = useMemo(() => timezoneService.getCityConfig(city), [timezoneService, city]);
  
  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(() => 
    `${STORAGE_KEYS.TILE_DATA_PREFIX}time-${city}`, 
    [city]
  );

  const fetchTimeData = useCallback(
    (forceRefresh = false) => {
      try {
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<TimeData>(storageKey);
          if (cached) {
            setTimeData(cached);
            setLastUpdated(new Date());
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
        setCachedData(storageKey, data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [timezoneService, cityConfig, storageKey],
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
