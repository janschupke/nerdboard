import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import type { FetchResult } from '../../../services/dataFetcher';

function useUraniumTileData(tileId: string) {
  const { getUraniumPrice } = useUraniumApi();
  const [result, setResult] = useState<FetchResult<UraniumTileData>>({
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
    getUraniumPrice(tileId, {}, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<UraniumTileData>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: RequestStatus.Error, error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getUraniumPrice, isForceRefresh]);
  return result;
}

const UraniumTileContent = ({ data, status }: { data: UraniumTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
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
          ${data.spotPrice}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Uranium Price
        </div>
      </div>
    );
  }
  return null;
};

export const UraniumTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = useUraniumTileData(tile.id);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <UraniumTileContent data={data} status={status} />
    </GenericTile>
  );
};

UraniumTile.displayName = 'UraniumTile';
