import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import type { RequestStatus } from '../../../services/dataFetcher';

function useTimeTileData(tileId: string) {
  const { getTime } = useTimeApi();
  const [result, setResult] = useState<{
    data: TimeTileData | null;
    status: RequestStatus;
    lastUpdated: Date | null;
    error: string | null;
    isCached: boolean;
    retryCount: number;
  }>({
    data: null,
    status: 'loading',
    lastUpdated: null,
    error: null,
    isCached: false,
    retryCount: 0,
  });
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let cancelled = false;
    setResult((r) => ({ ...r, status: 'loading' }));
    getTime(tileId, { city: 'Helsinki' }, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: 'error', error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getTime, isForceRefresh]);
  return result;
}

const TimeTileContent = ({ data, status }: { data: TimeTileData | null; status: RequestStatus }) => {
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }
  if (status === 'stale') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }
  if (status === 'success' && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          {data.currentTime}
        </div>
        <div className="text-sm text-theme-text-secondary">
          {data.timezone}
        </div>
      </div>
    );
  }
  return null;
};

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = useTimeTileData(tile.id);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <TimeTileContent data={data} status={status} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
