import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useFederalFundsTileData(
  tileId: string,
): ReturnType<GenericTileDataHook<FederalFundsRateData>> {
  const { getFederalFundsRate } = useFederalFundsApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<FederalFundsRateData | undefined>(undefined);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    getFederalFundsRate(tileId, { series_id: 'FEDFUNDS', file_type: 'json' }, isForceRefresh)
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
  }, [tileId, getFederalFundsRate, isForceRefresh]);
  return { loading, error, hasData, data };
}

export const FederalFundsRateTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useFederalFundsTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
