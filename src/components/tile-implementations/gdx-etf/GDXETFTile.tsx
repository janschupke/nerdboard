import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import type { FetchResult } from '../../../services/dataFetcher';

function useGdxEtfTileData(tileId: string) {
  const { getGDXETF } = useGdxEtfApi();
  const [result, setResult] = useState<FetchResult<GdxEtfTileData>>({
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
    getGDXETF(tileId, { function: 'GLOBAL_QUOTE', symbol: 'GDX', apikey: 'demo' }, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<GdxEtfTileData>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: RequestStatus.Error, error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getGDXETF, isForceRefresh]);
  return result;
}

const GDXETFTileContent = ({ data, status }: { data: GdxEtfTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
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
          ${data.currentPrice}
        </div>
        <div className="text-sm text-theme-text-secondary">
          GDX ETF
        </div>
      </div>
    );
  }
  return null;
};

export const GDXETFTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = useGdxEtfTileData(tile.id);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <GDXETFTileContent data={data} status={status} />
    </GenericTile>
  );
};

GDXETFTile.displayName = 'GDXETFTile';
