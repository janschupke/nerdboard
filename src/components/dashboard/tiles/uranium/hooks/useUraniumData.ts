import { useState, useEffect, useCallback } from 'react';
import { uraniumApi } from '../services/uraniumApi';
import { URANIUM_API_CONFIG } from '../constants';
import type { UraniumPriceData, UraniumTimeRange } from '../types';

interface UseUraniumDataReturn {
  uraniumData: UraniumPriceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUraniumData = (
  timeRange: UraniumTimeRange,
  refreshInterval: number = URANIUM_API_CONFIG.DEFAULT_REFRESH_INTERVAL,
): UseUraniumDataReturn => {
  const [uraniumData, setUraniumData] = useState<UraniumPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUraniumData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await uraniumApi.getUraniumData(timeRange);
      setUraniumData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch uranium data';
      setError(errorMessage);
      console.error('Error fetching uranium data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initial fetch
  useEffect(() => {
    fetchUraniumData();
  }, [fetchUraniumData]);

  // Set up interval for periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUraniumData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchUraniumData, refreshInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchUraniumData();
  }, [fetchUraniumData]);

  return {
    uraniumData,
    loading,
    error,
    refetch,
  };
}; 
