import { useState, useEffect, useCallback } from 'react';
import { EuriborRateApiService } from '../services/euriborRateApi';
import { EURIBOR_RATE_UI_CONFIG } from '../constants';
import type { EuriborRateData, TimeRange } from '../types';

const apiService = new EuriborRateApiService();

export const useEuriborRateData = () => {
  const [data, setData] = useState<EuriborRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(EURIBOR_RATE_UI_CONFIG.DEFAULT_TIME_RANGE);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async (range: TimeRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getEuriborRateData(range);
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Euribor rate data';
      setError(errorMessage);
      console.error('Euribor rate data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    loadData(newTimeRange);
  }, [loadData]);

  const refreshData = useCallback(() => {
    loadData(timeRange);
  }, [loadData, timeRange]);

  // Initial data load
  useEffect(() => {
    loadData(timeRange);
  }, [loadData, timeRange]);

  // Auto-refresh every 24 hours
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (data && lastRefresh) {
        const hoursSinceLastRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastRefresh >= 24) {
          refreshData();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [data, lastRefresh, refreshData]);

  return {
    data,
    loading,
    error,
    timeRange,
    lastRefresh,
    setTimeRange: handleTimeRangeChange,
    refreshData,
    isLoading: loading,
    hasError: !!error,
    hasData: !!data
  };
}; 
