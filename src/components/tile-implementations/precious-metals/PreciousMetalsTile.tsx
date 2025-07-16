import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function usePreciousMetalsTileData(
  tileId: string,
): ReturnType<GenericTileDataHook<PreciousMetalsTileData>> {
  const { getPreciousMetals } = usePreciousMetalsApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreciousMetalsTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getPreciousMetals(tileId, {}, isForceRefresh)
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
  }, [tileId, getPreciousMetals, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const PreciousMetalsTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = usePreciousMetalsTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
