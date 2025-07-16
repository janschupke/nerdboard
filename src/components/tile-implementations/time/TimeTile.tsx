import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useTimeTileData(tileId: string): { loading: boolean; error: string | null; hasData: boolean; data?: TimeTileData } {
  const { getTime } = useTimeApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TimeTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getTime(tileId, { city: 'Helsinki' }, isForceRefresh)
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
  }, [tileId, getTime, isForceRefresh]);
  return { loading, error, hasData: !!data && !!data.currentTime, data };
}

export const TimeTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useTimeTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

TimeTile.displayName = 'TimeTile';
