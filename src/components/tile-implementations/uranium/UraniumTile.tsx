import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumPriceData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useUraniumTileData(tileId: string): ReturnType<GenericTileDataHook<UraniumPriceData>> {
  const { getUraniumPrice } = useUraniumApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<UraniumPriceData | undefined>(undefined);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    getUraniumPrice(tileId, {}, isForceRefresh)
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && typeof result.spotPrice === 'number');
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
  }, [tileId, getUraniumPrice, isForceRefresh]);
  return { loading, error, hasData, data };
}

export const UraniumTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useUraniumTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

UraniumTile.displayName = 'UraniumTile';
