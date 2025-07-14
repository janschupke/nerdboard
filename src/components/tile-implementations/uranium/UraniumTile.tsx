import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumPriceData } from './types';

function useUraniumTileData(tileId: string): ReturnType<GenericTileDataHook<UraniumPriceData>> {
  const { getUraniumPrice } = useUraniumApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<UraniumPriceData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getUraniumPrice(tileId, {})
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
  }, [tileId, getUraniumPrice]);
  return { loading, error, hasData, data };
}

export const UraniumTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile<UraniumPriceData>
        tile={tile}
        meta={meta}
        useTileData={useUraniumTileData}
        {...rest}
      />
    );
  },
);

UraniumTile.displayName = 'UraniumTile';
