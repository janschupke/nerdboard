import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import type { CryptocurrencyData } from '../types/cryptocurrency';

export function useCryptocurrencyData(
  refreshInterval: number = 30000,
  service: CoinGeckoApiService = new CoinGeckoApiService(),
) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getTopCryptocurrencies(10);

      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('No cryptocurrency data received');
      }

      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data';
      setError(errorMessage);
      console.error('Error fetching cryptocurrency data:', err);

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
