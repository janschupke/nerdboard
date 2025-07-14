import { useState, useEffect, useCallback, useMemo } from 'react';
import { GDXETFApiService } from '../services/gdxEtfApi';
import { GDX_ERROR_MESSAGES } from '../constants';
import type { GDXETFData, GDXETFPriceHistory, ChartPeriod } from '../types';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';
import { useStorageManager } from '../../../../../services/storageManagerUtils';

const apiService = new GDXETFApiService();

export function useGDXETFData(refreshInterval: number = REFRESH_INTERVALS.TILE_DATA) {
  const [data, setData] = useState<GDXETFData | null>(null);
  // Removed setPriceHistory
  const [priceHistory] = useState<GDXETFPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('1M');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const storage = useStorageManager();

  // Memoize storageKey to prevent recreation on every render
  const storageKey = useMemo(() => `${STORAGE_KEYS.TILE_DATA_PREFIX}gdx-etf`, []);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = storage.getTileConfig(storageKey);
          if (cached && cached.data) {
            setData(cached.data as unknown as GDXETFData);
            setLastUpdated(new Date(cached.lastDataRequest));
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const result = await apiService.getGDXETFData();
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
        const errorMessage = err instanceof Error ? err.message : GDX_ERROR_MESSAGES.FETCH_FAILED;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [storageKey, storage],
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

  return {
    data,
    priceHistory,
    loading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    lastUpdated,
    isCached,
  };
}
