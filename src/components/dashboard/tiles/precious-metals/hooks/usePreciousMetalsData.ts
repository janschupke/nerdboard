import { useState, useEffect, useCallback } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import { PRECIOUS_METALS_API_CONFIG, PRECIOUS_METALS_ERROR_MESSAGES } from '../constants';
import type { PreciousMetalsData } from '../types';

const apiService = new PreciousMetalsApiService();

export function usePreciousMetalsData(
  refreshInterval: number = PRECIOUS_METALS_API_CONFIG.DEFAULT_REFRESH_INTERVAL,
) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getPreciousMetalsData();
      setData(result);
      setLastUpdated(new Date());
      setIsCached(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchData();
    };

    window.addEventListener('refresh-all-tiles', handleGlobalRefresh);

    return () => {
      window.removeEventListener('refresh-all-tiles', handleGlobalRefresh);
    };
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isCached,
    refetch,
  };
}
