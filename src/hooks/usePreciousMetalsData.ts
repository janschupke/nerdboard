import { useState, useEffect, useCallback } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import type { PreciousMetalsData } from '../types/preciousMetals';

const apiService = new PreciousMetalsApiService();

export function usePreciousMetalsData(refreshInterval: number = 300000) {
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
      setError(err instanceof Error ? err.message : 'Failed to fetch precious metals data');
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
