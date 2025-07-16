import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useFederalFundsTileData(
  tileId: string,
): ReturnType<GenericTileDataHook<FederalFundsRateTileData>> {
  const { getFederalFundsRate } = useFederalFundsApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FederalFundsRateTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getFederalFundsRate(tileId, { series_id: 'FEDFUNDS', file_type: 'json' }, isForceRefresh)
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
  }, [tileId, getFederalFundsRate, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const FederalFundsRateTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useFederalFundsTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
