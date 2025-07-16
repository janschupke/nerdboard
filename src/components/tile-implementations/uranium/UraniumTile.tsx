import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useUraniumTileData(tileId: string): ReturnType<GenericTileDataHook<UraniumTileData>> {
  const { getUraniumPrice } = useUraniumApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UraniumTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getUraniumPrice(tileId, {}, isForceRefresh)
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
  }, [tileId, getUraniumPrice, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const UraniumTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useUraniumTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

UraniumTile.displayName = 'UraniumTile';
