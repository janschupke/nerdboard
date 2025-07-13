import { useState, useEffect, useCallback } from 'react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import type { PreciousMetalsData } from '../types/preciousMetals';

export function usePreciousMetalsData(
  refreshInterval: number = 300000,
  service: PreciousMetalsApiService = new PreciousMetalsApiService(),
) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getPreciousMetalsData();

      // Validate the result
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid precious metals data received');
      }

      if (!result.gold || !result.silver) {
        throw new Error('Incomplete precious metals data received');
      }

      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch precious metals data';
      setError(errorMessage);

      // Increment retry count for potential retry logic
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    retryCount,
    refetch,
  };
}
