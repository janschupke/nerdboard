import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';

function useCryptoTileData(
  tileId: string,
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
  }, [tileId, getCryptocurrencyMarkets]);
  return { loading, error, hasData, data };
}

export const CryptocurrencyTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DashboardTile; meta: TileMeta }) => {
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        id={tile.id}
        position={tile.position}
        size={tile.size}
        useTileData={useCryptoTileData}
        {...rest}
      />
    );
  },
);

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
