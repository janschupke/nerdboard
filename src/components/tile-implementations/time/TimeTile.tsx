import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useTimeApi } from './useTimeApi';
import type { TimeData } from './types';

function useTimeTileData(tileId: string): ReturnType<GenericTileDataHook<TimeData>> {
  const { getTime } = useTimeApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<TimeData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getTime(tileId, { city: 'Helsinki' })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && !!result.currentTime);
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
  }, [tileId, getTime]);
  return { loading, error, hasData, data };
}

export const TimeTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile<TimeData>
        tile={tile}
        meta={meta}
        useTileData={useTimeTileData}
        {...rest}
      />
    );
  },
);

TimeTile.displayName = 'TimeTile';
