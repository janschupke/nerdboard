import { useState, useEffect, useCallback } from 'react';
import { CoinGeckoApiService } from '../services/coinGeckoApi';
import { CRYPTO_API_CONFIG, CRYPTO_ERROR_MESSAGES } from '../constants';
import { REFRESH_INTERVALS } from '../../../../../utils/constants';
import type { CryptocurrencyData } from '../types';

const apiService = new CoinGeckoApiService();

interface CryptocurrencyDataConfig {
  refreshInterval?: number;
}

export function useCryptocurrencyData(config: CryptocurrencyDataConfig = {}) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const refreshInterval = config.refreshInterval ?? REFRESH_INTERVALS.TILE_DATA;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getTopCryptocurrencies(CRYPTO_API_CONFIG.DEFAULT_LIMIT);
      setData(result);
      setLastUpdated(new Date());
      setIsCached(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : CRYPTO_ERROR_MESSAGES.FETCH_FAILED);
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
