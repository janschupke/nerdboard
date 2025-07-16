import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function usePreciousMetalsTileData(
  tileId: string,
): ReturnType<GenericTileDataHook<PreciousMetalsData>> {
  const { getPreciousMetals } = usePreciousMetalsApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<PreciousMetalsData | undefined>(undefined);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    getPreciousMetals(tileId, {}, isForceRefresh)
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
  }, [tileId, getPreciousMetals, isForceRefresh]);
  return { loading, error, hasData, data };
}

export const PreciousMetalsTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = usePreciousMetalsTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
