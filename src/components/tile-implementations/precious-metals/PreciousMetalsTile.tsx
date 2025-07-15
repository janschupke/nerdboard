import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsData } from './types';

function usePreciousMetalsTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<PreciousMetalsData>> {
  const { getPreciousMetals } = usePreciousMetalsApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<PreciousMetalsData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getPreciousMetals(tileId, {})
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && !!result.gold && !!result.silver);
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
  }, [tileId, getPreciousMetals, refreshKey]);
  return { loading, error, hasData, data };
}

export const PreciousMetalsTile = React.memo(
  ({ tile, meta, refreshKey, ...rest }: { tile: DashboardTile; meta: TileMeta; refreshKey?: number }) => {
    const useTileData = (id: string) => usePreciousMetalsTileData(id, refreshKey);
    return <GenericTile tile={tile} meta={meta} useTileData={useTileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
