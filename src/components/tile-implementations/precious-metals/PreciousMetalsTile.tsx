import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import type { FetchResult } from '../../../services/dataFetcher';

function usePreciousMetalsTileData(tileId: string) {
  const { getPreciousMetals } = usePreciousMetalsApi();
  const [result, setResult] = useState<FetchResult<PreciousMetalsTileData>>({
    data: null,
    status: RequestStatus.Loading,
    lastUpdated: null,
    error: null,
    isCached: false,
    retryCount: 0,
  });
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let cancelled = false;
    setResult((r) => ({ ...r, status: RequestStatus.Loading }));
    getPreciousMetals(tileId, { access_key: 'demo' }, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<PreciousMetalsTileData>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: RequestStatus.Error, error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getPreciousMetals, isForceRefresh]);
  return result;
}

const PreciousMetalsTileContent = ({ data, status }: { data: PreciousMetalsTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
  if (status === RequestStatus.Loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }
  if (status === RequestStatus.Error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }
  if (status === RequestStatus.Stale) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }
  if (status === RequestStatus.Success && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          ${data.gold.price}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Gold Price
        </div>
      </div>
    );
  }
  return null;
};

export const PreciousMetalsTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = usePreciousMetalsTileData(tile.id);
  const lastUpdate = data?.gold?.lastUpdated || data?.silver?.lastUpdated || (lastUpdated ? lastUpdated.toISOString() : undefined);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdate}
      {...rest}
    >
      <PreciousMetalsTileContent data={data} status={status} />
    </GenericTile>
  );
};

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
