import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const CryptocurrencyTileContent = ({ data }: { data: CryptocurrencyTileData | null }) => {
  if (data && data.coins.length > 0) {
    const topCoin = data.coins[0];
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold">${topCoin.current_price.toFixed(2)}</div>
        <div className="text-sm">{topCoin.name}</div>
      </div>
    );
  }
  return null;
};

export const CryptocurrencyTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const params = useMemo(() => ({ vs_currency: 'usd' }), []);
  const { data, status, lastUpdated } = useTileData(
    getCryptocurrencyMarkets,
    tile.id,
    params,
    isForceRefresh,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <CryptocurrencyTileContent data={data} />
    </GenericTile>
  );
};

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
