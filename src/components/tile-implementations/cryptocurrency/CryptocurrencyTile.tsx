import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import type { TileStatus } from '../../tile/tileStatus';

function useCryptoTileData(tileId: string): TileStatus & { data?: CryptocurrencyTileData } {
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CryptocurrencyTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getCryptocurrencyMarkets(tileId, { vs_currency: 'usd' }, isForceRefresh)
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setData(undefined);
        setError(err?.message || 'Error');
        setLoading(false);
      });
  }, [tileId, getCryptocurrencyMarkets, isForceRefresh]);
  return {
    loading,
    error,
    hasData: !!data && Array.isArray(data.coins) && data.coins.length > 0,
    data,
  };
}

const CryptocurrencyTileContent = ({ tileData }: { tileData: TileStatus & { data?: CryptocurrencyTileData } }) => {
  const { error, data } = tileData;

  console.log('CryptocurrencyTileContent tileData', tileData);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }

  const topCoin = data?.coins[0];
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <div className="text-2xl font-bold">
        ${topCoin?.current_price.toFixed(2)}
      </div>
      <div className="text-sm">
        {topCoin?.name}
      </div>
    </div>
  );
};

export const CryptocurrencyTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useCryptoTileData(tile.id);
    console.log('CryptocurrencyTile tileData', tileData);
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        loading={tileData.loading}
        error={tileData.error}
        hasData={tileData.hasData}
        lastUpdate={tileData.data?.lastUpdated}
        {...rest}
      >
        <CryptocurrencyTileContent tileData={tileData} />
      </GenericTile>
    );
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
