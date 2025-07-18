import { useState, useEffect } from 'react';
import type { TileDataHook } from '../../tile/tileStatus';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

export function useTimeTileData(tileId: string): ReturnType<TileDataHook<TimeTileData>> {
  const { getTime } = useTimeApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TimeTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getTime(tileId, { city: 'Helsinki' }, isForceRefresh)
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setData(undefined);
        setError(err?.message || 'Error');
        setLoading(false);
      });
  }, [tileId, getTime, isForceRefresh]);
  return { loading, error, hasData: !!data && !!data.currentTime, data };
} 
