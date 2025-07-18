import { useState, useEffect, useMemo } from 'react';
import type { TileConfig, TileDataType } from '../../services/storageManager';
import { DATA_FRESHNESS_INTERVAL } from '../../services/dataFetcher';

export const TileStatus = {
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
  Stale: 'stale',
} as const;
export type TileStatus = typeof TileStatus[keyof typeof TileStatus];

export function useTileData<T extends TileDataType, P>(
  apiFn: (tileId: string, params: P, forceRefresh?: boolean) => Promise<TileConfig<T>>,
  tileId: string,
  params: P,
  forceRefresh: boolean
): { data: T | null; status: TileStatus; lastUpdated: Date | null } {
  const [result, setResult] = useState<TileConfig<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paramsString = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiFn(tileId, params, forceRefresh)
      .then((tileConfig) => {
        if (!cancelled) {
          setResult(tileConfig);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiFn, tileId, params, paramsString, forceRefresh]);

  // Calculate status
  let status: TileStatus = TileStatus.Loading;
  let lastUpdated: Date | null = null;
  let data: T | null = null;

  if (isLoading) {
    status = TileStatus.Loading;
  } else if (result) {
    data = result.data;
    lastUpdated = result.lastDataRequest ? new Date(result.lastDataRequest) : null;
    if (result.lastDataRequestSuccessful && data) {
      // Data is present and last request was successful
      const now = Date.now();
      const isFresh = result.lastDataRequest && (now - result.lastDataRequest < DATA_FRESHNESS_INTERVAL);
      status = isFresh ? TileStatus.Success : TileStatus.Stale;
    } else if (!result.lastDataRequestSuccessful && data) {
      // Data is present but last request failed
      status = TileStatus.Stale;
    } else {
      // No data and last request failed
      status = TileStatus.Error;
    }
  }

  return { data, status, lastUpdated };
} 
