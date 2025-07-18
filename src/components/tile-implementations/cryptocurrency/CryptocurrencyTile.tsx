import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import { useTileData } from '../../tile/useTileData';

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
  const isForceRefresh = useForceRefreshFromKey();
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const { data, status, lastUpdated } = useTileData(getCryptocurrencyMarkets, tile.id, { vs_currency: 'usd' }, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <CryptocurrencyTileContent data={data as CryptocurrencyTileData | null} status={status} />
    </GenericTile>
  );
};

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
