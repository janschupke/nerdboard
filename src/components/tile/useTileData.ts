import { useState, useEffect, useMemo } from 'react';
import type { FetchResult, RequestStatus } from '../../services/dataFetcher';

export function useTileData<T, P>(
  apiFn: (tileId: string, params: P, forceRefresh?: boolean) => Promise<FetchResult<T>>,
  tileId: string,
  params: P,
  forceRefresh: boolean
): FetchResult<T> {
  const [result, setResult] = useState<FetchResult<T>>({
    data: null,
    status: 'loading' as RequestStatus,
    lastUpdated: null,
    error: null,
    isCached: false,
    retryCount: 0,
  });

  const paramsString = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let cancelled = false;
    setResult((r) => ({ ...r, status: 'loading' as RequestStatus }));
    apiFn(tileId, params, forceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<T>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({
            ...r,
            status: 'error' as RequestStatus,
            error: err?.message || 'Error',
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [apiFn, tileId, params, paramsString, forceRefresh]);

  return result;
} 
