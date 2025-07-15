import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';

function useFederalFundsTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<unknown>> {
  const { getFederalFundsRate } = useFederalFundsApi();
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
    getFederalFundsRate(tileId, { series_id: 'FEDFUNDS', file_type: 'json' })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && !!result.currentRate);
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
  }, [tileId, getFederalFundsRate, refreshKey]);
  return { loading, error, hasData, data };
}

export const FederalFundsRateTile = React.memo(
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
    const tileData = useFederalFundsTileData(tile.id, refreshKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
