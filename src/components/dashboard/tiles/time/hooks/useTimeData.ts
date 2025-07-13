import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimezoneService } from '../services/timezoneService';
import { TIME_CONFIG } from '../constants';
import type { TimeData } from '../types';

interface UseTimeDataReturn {
  timeData: TimeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTimeData = (
  city: 'helsinki' | 'prague' | 'taipei',
  refreshInterval: number = TIME_CONFIG.UPDATE_INTERVAL,
): UseTimeDataReturn => {
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timezoneService = useMemo(() => TimezoneService.getInstance(), []);
  const cityConfig = useMemo(() => timezoneService.getCityConfig(city), [timezoneService, city]);

  const fetchTimeData = useCallback(() => {
    try {
      setError(null);
      const data = timezoneService.getTimeData(cityConfig);
      setTimeData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time data';
      setError(errorMessage);
      console.error('Error fetching time data:', err);
    } finally {
      setLoading(false);
    }
  }, [timezoneService, cityConfig]);

  // Initial fetch
  useEffect(() => {
    fetchTimeData();
  }, [fetchTimeData]);

  // Set up interval for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimeData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchTimeData, refreshInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchTimeData();
  }, [fetchTimeData]);

  return {
    timeData,
    loading,
    error,
    refetch,
  };
}; 
