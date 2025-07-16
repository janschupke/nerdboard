import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEuriborApi } from './useEuriborApi';
import type { EuriborRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useEuriborTileData(tileId: string): {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  data?: EuriborRateTileData;
} {
  const { getEuriborRate } = useEuriborApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EuriborRateTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getEuriborRate(tileId, isForceRefresh)
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
  }, [tileId, getEuriborRate, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const EuriborRateTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useEuriborTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

EuriborRateTile.displayName = 'EuriborRateTile';
