import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { PriceDisplay } from '../../ui/PriceDisplay';

const CryptocurrencyTileContent = ({ data }: { data: CryptocurrencyTileData | null }) => {
  if (data && data.coins.length > 0) {
    const coins = data.coins.slice(0, 5);

    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            {coins.map((coin, index) => (
              <div
                key={coin.id}
                className="flex items-center justify-between py-1 border-b border-theme-secondary last:border-b-0"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-xs text-theme-tertiary w-4 text-right">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-theme-primary">
                      {coin.name}
                    </div>
                    <div className="text-xs text-theme-tertiary uppercase">{coin.symbol}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <PriceDisplay price={coin.current_price} currency="USD" className="text-xs" />
                  <div
                    className={`text-xs ${
                      coin.price_change_percentage_24h >= 0
                        ? 'text-status-success'
                        : 'text-status-error'
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
  const params = useMemo(
    () => ({
      vs_currency: 'usd',
      per_page: 5,
      order: 'market_cap_desc',
    }),
    [],
  );
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
