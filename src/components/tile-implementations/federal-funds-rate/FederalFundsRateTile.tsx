import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import type { TileStatus } from '../../tile/tileStatus';

function useFederalFundsTileData(tileId: string): TileStatus & { data?: FederalFundsRateTileData } {
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

const FederalFundsRateTileContent = ({ tileData }: { tileData: TileStatus & { data?: FederalFundsRateTileData } }) => {
  const { loading, error, hasData, data } = tileData;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }

  if (error && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }

  if (error && hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }

  if (hasData && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          {data.currentRate}%
        </div>
        <div className="text-sm text-theme-text-secondary">
          Federal Funds Rate
        </div>
      </div>
    );
  }

  return null;
};

export const FederalFundsRateTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useFederalFundsTileData(tile.id);
    let lastUpdate: string | undefined = undefined;
    if (tileData.data?.lastUpdate) {
      lastUpdate = typeof tileData.data.lastUpdate === 'string' ? tileData.data.lastUpdate : tileData.data.lastUpdate.toISOString();
    }
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        loading={tileData.loading}
        error={tileData.error}
        hasData={tileData.hasData}
        lastUpdate={lastUpdate}
        {...rest}
      >
        <FederalFundsRateTileContent tileData={tileData} />
      </GenericTile>
    );
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
