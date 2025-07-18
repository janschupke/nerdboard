import { useState, useEffect, useMemo } from 'react';
import type { TileConfig, TileDataType } from '../../services/storageManager';

export const TileStatus = {
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
  Stale: 'stale',
} as const;
export type TileStatus = (typeof TileStatus)[keyof typeof TileStatus];

export function useTileData<T extends TileDataType, P>(
  apiFn: (tileId: string, params: P, forceRefresh?: boolean) => Promise<TileConfig<T>>,
  tileId: string,
  params: P,
  forceRefresh: boolean,
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
      status = TileStatus.Success;
    } else if (!result.lastDataRequestSuccessful && data) {
      status = TileStatus.Stale;
    } else {
      status = TileStatus.Error;
    }
  }

  return { data, status, lastUpdated };
}
