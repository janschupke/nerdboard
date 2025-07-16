import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useCryptoTileData(
  tileId: string,
): ReturnType<GenericTileDataHook<CryptocurrencyTileData>> {
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

export const CryptocurrencyTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useCryptoTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
