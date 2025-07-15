import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useGdxEtfApi } from './useGdxEtfApi';

function useGdxEtfTileData(tileId: string): ReturnType<GenericTileDataHook<unknown>> {
  const { getGDXETF } = useGdxEtfApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<unknown>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getGDXETF(tileId, { symbol: 'GDX' })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result);
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
  }, [tileId, getGDXETF]);
  return { loading, error, hasData, data };
}

export const GDXETFTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile<unknown> tile={tile} meta={meta} useTileData={useGdxEtfTileData} {...rest} />
    );
  },
);

GDXETFTile.displayName = 'GDXETFTile';
