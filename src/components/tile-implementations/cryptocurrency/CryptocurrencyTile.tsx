import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyData } from './types';

function useCryptoTileData(tileId: string): ReturnType<GenericTileDataHook<CryptocurrencyData[]>> {
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<CryptocurrencyData[] | undefined>(undefined);

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
        setHasData(Array.isArray(result) && result.length > 0);
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

export const CryptocurrencyTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile<CryptocurrencyData[]>
        tile={tile}
        meta={meta}
        useTileData={useCryptoTileData}
        {...rest}
      />
    );
  },
);

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
