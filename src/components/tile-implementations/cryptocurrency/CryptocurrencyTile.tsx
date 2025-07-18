import { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import type { FetchResult } from '../../../services/dataFetcher';

function useCryptoTileData(tileId: string) {
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const [result, setResult] = useState<FetchResult<CryptocurrencyTileData>>({
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
    getCryptocurrencyMarkets(tileId, { vs_currency: 'usd' }, isForceRefresh)
      .then((fetchResult) => {
        if (!cancelled) setResult(fetchResult as FetchResult<CryptocurrencyTileData>);
      })
      .catch((err) => {
        if (!cancelled)
          setResult((r) => ({ ...r, status: RequestStatus.Error, error: err?.message || 'Error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [tileId, getCryptocurrencyMarkets, isForceRefresh]);
  return result;
}

const CryptocurrencyTileContent = ({ data, status }: { data: CryptocurrencyTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
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
  if (status === RequestStatus.Success && data && data.coins.length > 0) {
    const topCoin = data.coins[0];
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold">
          ${topCoin.current_price.toFixed(2)}
        </div>
        <div className="text-sm">
          {topCoin.name}
        </div>
      </div>
    );
  }
  return null;
};

export const CryptocurrencyTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { data, status, lastUpdated } = useCryptoTileData(tile.id);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <CryptocurrencyTileContent data={data} status={status} />
    </GenericTile>
  );
};

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
