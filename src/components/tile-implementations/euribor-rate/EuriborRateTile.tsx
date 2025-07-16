import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEuriborApi } from './useEuriborApi';
import type { EuriborRateData } from './types';

function useEuriborTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<EuriborRateData>> {
  const { getEuriborRate } = useEuriborApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<EuriborRateData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    getEuriborRate(tileId)
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && typeof result.currentRate === 'number');
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
  }, [tileId, getEuriborRate, refreshKey]);
  return { loading, error, hasData, data };
}

export const EuriborRateTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useEuriborTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

EuriborRateTile.displayName = 'EuriborRateTile';
