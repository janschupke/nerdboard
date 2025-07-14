import { useMemo } from 'react';

export const useWeatherData = () => {
  // Replace with actual data fetching logic as needed
  const data = useMemo(() => ({}), []);
  const loading = false;
  const error = null;

  const hasLocalData = useMemo(() => {
    return data && (data as unknown as { current?: unknown }).current;
  }, [data]);

  const lastRequestResult = useMemo(() => {
    if (loading) return null;
    if (error) return 'error';
    if (data && (data as unknown as { current?: unknown }).current) return 'success';
    return 'failure';
  }, [loading, error, data]);

  return {
    data,
    loading,
    error,
    lastRequestResult,
    hasLocalData,
  };
};
