import { useState, useEffect, useCallback } from 'react';
import { GDXETFApiService } from '../services/gdxEtfApi';
import { GDX_ERROR_MESSAGES } from '../constants';
import type { GDXETFData, GDXETFPriceHistory, ChartPeriod } from '../types';
import { getCachedData, setCachedData } from '../../../../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../../utils/constants';

const apiService = new GDXETFApiService();

export function useGDXETFData(refreshInterval: number = REFRESH_INTERVALS.TILE_DATA) {
  const [data, setData] = useState<GDXETFData | null>(null);
  const [priceHistory, setPriceHistory] = useState<GDXETFPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('1M');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}gdx-etf`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<GDXETFData>(storageKey);
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        const result = await apiService.getGDXETFData();
        setData(result);
        setLastUpdated(new Date());
        setIsCached(false);

        // Cache the fresh data
        setCachedData(storageKey, result);
      } catch (err) {
        setError(err instanceof Error ? err.message : GDX_ERROR_MESSAGES.FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [storageKey],
  );

  const fetchPriceHistory = useCallback(async (period: ChartPeriod) => {
    try {
      const result = await apiService.getPriceHistory(period);
      setPriceHistory(result);
    } catch {
      // Don't set error for price history as it's not critical
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchPriceHistory(selectedPeriod);

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, fetchPriceHistory, selectedPeriod, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData(true);
    fetchPriceHistory(selectedPeriod);
  }, [fetchData, fetchPriceHistory, selectedPeriod]);

  const changePeriod = useCallback(
    (period: ChartPeriod) => {
      setSelectedPeriod(period);
      fetchPriceHistory(period);
    },
    [fetchPriceHistory],
  );

  return {
    data,
    priceHistory,
    loading,
    error,
    selectedPeriod,
    lastUpdated,
    isCached,
    refetch,
    changePeriod,
  };
}
