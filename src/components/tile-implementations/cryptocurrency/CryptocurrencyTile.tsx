import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';

function useCryptoTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<CryptocurrencyTileData>> {
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<CryptocurrencyTileData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getCryptocurrencyMarkets(tileId, { vs_currency: 'usd' })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(Array.isArray(result.coins) && result.coins.length > 0);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Error');
        setHasData(false);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tileId, getCryptocurrencyMarkets, refreshKey]);
  return { loading, error, hasData, data };
}

export const CryptocurrencyTile = React.memo(
  ({
    tile,
    meta,
    refreshKey,
    ...rest
  }: {
    tile: DragboardTileData;
    meta: TileMeta;
    refreshKey?: number;
  }) => {
    const tileData = useCryptoTileData(tile.id, refreshKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
