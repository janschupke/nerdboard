import { useState, useEffect, useCallback } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import { PRECIOUS_METALS_API_CONFIG, PRECIOUS_METALS_ERROR_MESSAGES } from '../constants';
import type { PreciousMetalsData } from '../types';

const apiService = new PreciousMetalsApiService();

export function usePreciousMetalsData(refreshInterval: number = PRECIOUS_METALS_API_CONFIG.DEFAULT_REFRESH_INTERVAL) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getPreciousMetalsData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED);
      console.error('Error fetching precious metals data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    refetch,
  };
} 
