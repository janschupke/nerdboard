import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import { CRYPTO_API_CONFIG, CRYPTO_ERROR_MESSAGES } from '../constants';
import type { CryptocurrencyData } from '../types';

const apiService = new CoinGeckoApiService();

export function useCryptocurrencyData(refreshInterval: number = CRYPTO_API_CONFIG.DEFAULT_REFRESH_INTERVAL) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getTopCryptocurrencies(CRYPTO_API_CONFIG.DEFAULT_LIMIT);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : CRYPTO_ERROR_MESSAGES.FETCH_FAILED);
      console.error('Error fetching cryptocurrency data:', err);
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
