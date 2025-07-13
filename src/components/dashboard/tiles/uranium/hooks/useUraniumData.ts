import { useState, useEffect, useCallback, useMemo } from 'react';
import { uraniumApi } from '../services/uraniumApi';
import type { UraniumPriceData, UraniumTimeRange } from '../types';
import { getCachedData, setCachedData } from '../../../../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';

interface UseUraniumDataReturn {
  uraniumData: UraniumPriceData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isCached: boolean;
  refetch: () => void;
}

export const useUraniumData = (
  timeRange: UraniumTimeRange,
  refreshInterval: number = REFRESH_INTERVALS.TILE_DATA,
): UseUraniumDataReturn => {
  const [uraniumData, setUraniumData] = useState<UraniumPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(
    () => `${STORAGE_KEYS.TILE_DATA_PREFIX}uranium-${timeRange}`,
    [timeRange],
  );

  const fetchUraniumData = useCallback(
    async (forceRefresh = false) => {
      try {
        setError(null);
        setLoading(true);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<UraniumPriceData>(storageKey);
          if (cached) {
            setUraniumData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        const data = await uraniumApi.getUraniumData(timeRange);
        setUraniumData(data);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        setCachedData(storageKey, data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch uranium data';
        setError(errorMessage);
        console.error('Error fetching uranium data:', err);
      } finally {
        setLoading(false);
      }
    },
    [timeRange, storageKey],
  );

  // Initial fetch
  useEffect(() => {
    fetchUraniumData();
  }, [fetchUraniumData]);

  // Set up interval for periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUraniumData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchUraniumData, refreshInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchUraniumData(true);
  }, [fetchUraniumData]);

  return {
    uraniumData,
    loading,
    error,
    lastUpdated,
    isCached,
    refetch,
  };
};
