import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import type { FetchResult } from '../../../services/dataFetcher';

function useFederalFundsTileData(tileId: string) {
  const { getFederalFundsRate } = useFederalFundsApi();
  const [result, setResult] = useState<FetchResult<FederalFundsRateTileData>>({
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
    getFederalFundsRate(tileId, { series_id: 'FEDFUNDS', file_type: 'json' }, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<FederalFundsRateTileData>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: RequestStatus.Error, error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getFederalFundsRate, isForceRefresh]);
  return result;
}

const FederalFundsRateTileContent = ({ data, status }: { data: FederalFundsRateTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
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
          {data.currentRate}%
        </div>
        <div className="text-sm text-theme-text-secondary">
          Federal Funds Rate
        </div>
      </div>
    );
  }
  return null;
};

export const FederalFundsRateTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = useFederalFundsTileData(tile.id);
  let lastUpdate: string | undefined = undefined;
  if (data?.lastUpdate) {
    lastUpdate = typeof data.lastUpdate === 'string' ? data.lastUpdate : data.lastUpdate.toISOString();
  } else if (lastUpdated) {
    lastUpdate = lastUpdated.toISOString();
  }
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdate}
      {...rest}
    >
      <FederalFundsRateTileContent data={data} status={status} />
    </GenericTile>
  );
};

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
