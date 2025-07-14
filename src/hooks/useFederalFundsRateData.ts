import { useMemo } from 'react';

export const useFederalFundsRateData = () => {
  // Replace with actual data fetching logic as needed
  const data = useMemo(() => ({}), []);
  const loading = false;
  const error = null;

  const hasLocalData = useMemo(() => {
    return data && Object.keys(data).length > 0;
  }, [data]);

  const lastRequestResult = useMemo(() => {
    if (loading) return null;
    if (error) return 'error';
    if (data && Object.keys(data).length > 0) return 'success';
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
