import { useState, useEffect, useCallback } from 'react';
import { GDXETFApiService } from '../services/gdxEtfApi';
import { GDX_API_CONFIG, GDX_ERROR_MESSAGES } from '../constants';
import type { GDXETFData, GDXETFPriceHistory, ChartPeriod } from '../types';

const apiService = new GDXETFApiService();

export function useGDXETFData(
  refreshInterval: number = GDX_API_CONFIG.DEFAULT_REFRESH_INTERVAL,
) {
  const [data, setData] = useState<GDXETFData | null>(null);
  const [priceHistory, setPriceHistory] = useState<GDXETFPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('1M');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getGDXETFData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : GDX_ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchData();
    fetchPriceHistory(selectedPeriod);
  }, [fetchData, fetchPriceHistory, selectedPeriod]);

  const changePeriod = useCallback((period: ChartPeriod) => {
    setSelectedPeriod(period);
    fetchPriceHistory(period);
  }, [fetchPriceHistory]);

  return {
    data,
    priceHistory,
    loading,
    error,
    selectedPeriod,
    refetch,
    changePeriod,
  };
} 
