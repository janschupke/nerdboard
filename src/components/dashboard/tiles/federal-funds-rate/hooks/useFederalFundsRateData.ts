import { useState, useEffect, useCallback } from 'react';
import { FederalFundsRateApiService } from '../services/federalFundsRateApi';
import { FEDERAL_FUNDS_API_CONFIG, FEDERAL_FUNDS_ERROR_MESSAGES } from '../constants';
import type { FederalFundsRateData, TimeRange } from '../types';

const apiService = new FederalFundsRateApiService();

export function useFederalFundsRateData(
  refreshInterval: number = FEDERAL_FUNDS_API_CONFIG.DEFAULT_REFRESH_INTERVAL,
) {
  const [data, setData] = useState<FederalFundsRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getFederalFundsRateData(timeRange);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : FEDERAL_FUNDS_ERROR_MESSAGES.FETCH_FAILED);
      console.error('Error fetching Federal Funds rate data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const updateTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange: updateTimeRange,
    refetch,
  };
} 
