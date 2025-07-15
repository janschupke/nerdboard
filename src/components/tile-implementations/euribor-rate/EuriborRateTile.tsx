import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useEuriborApi } from './useEuriborApi';

function useEuriborTileData(tileId: string): ReturnType<GenericTileDataHook<unknown>> {
  const { getEuriborRate } = useEuriborApi();
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
    getEuriborRate()
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
  }, [getEuriborRate, tileId]);
  return { loading, error, hasData, data };
}

export const EuriborRateTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile<unknown> tile={tile} meta={meta} useTileData={useEuriborTileData} {...rest} />
    );
  },
);

EuriborRateTile.displayName = 'EuriborRateTile';
