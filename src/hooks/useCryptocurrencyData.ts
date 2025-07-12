import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import type { CryptocurrencyData } from '../types/cryptocurrency';

export function useCryptocurrencyData(refreshInterval: number = 30000, service: CoinGeckoApiService = new CoinGeckoApiService()) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getTopCryptocurrencies(10);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data');
      console.error('Error fetching cryptocurrency data:', err);
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
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
