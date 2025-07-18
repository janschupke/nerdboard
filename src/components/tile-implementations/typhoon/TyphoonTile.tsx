import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTyphoonApi } from './useTyphoonApi';
import type { TyphoonTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import type { TileStatus } from '../../tile/tileStatus';

function useTyphoonTileData(tileId: string): TileStatus & { data?: TyphoonTileData } {
  const { getTyphoonData } = useTyphoonApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TyphoonTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getTyphoonData(tileId, 'demo', isForceRefresh)
      .then((result: TyphoonTileData) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err: Error) => {
        setData(undefined);
        setError(err?.message || 'Error');
        setLoading(false);
      });
  }, [tileId, getTyphoonData, isForceRefresh]);
  return { loading, error, hasData: !!data && data.typhoons.length > 0, data };
}

const TyphoonTileContent = ({ tileData }: { tileData: TileStatus & { data?: TyphoonTileData } }) => {
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

  if (hasData && data && data.typhoons.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          {data.typhoons.length}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Active typhoons
        </div>
      </div>
    );
  }

  return null;
};

export const TyphoonTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useTyphoonTileData(tile.id);
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        loading={tileData.loading}
        error={tileData.error}
        hasData={tileData.hasData}
        lastUpdate={tileData.data?.lastUpdated}
        {...rest}
      >
        <TyphoonTileContent tileData={tileData} />
      </GenericTile>
    );
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

TyphoonTile.displayName = 'TyphoonTile';
