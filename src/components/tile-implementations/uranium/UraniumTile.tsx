import React, { useState, useEffect, useRef } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumPriceData } from './types';

function useUraniumTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<UraniumPriceData>> {
  const { getUraniumPrice } = useUraniumApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<UraniumPriceData | undefined>(undefined);
  const prevRefreshKeyRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    // Determine if this is a force refresh (refreshKey changed)
    const isForceRefresh = refreshKey !== undefined && refreshKey !== prevRefreshKeyRef.current;
    prevRefreshKeyRef.current = refreshKey;

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
  }, [tileId, getUraniumPrice, refreshKey]);
  return { loading, error, hasData, data };
}

export const UraniumTile = React.memo(
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
    const tileData = useUraniumTileData(tile.id, refreshKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

UraniumTile.displayName = 'UraniumTile';
