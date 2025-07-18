import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import type { TileStatus } from '../../tile/tileStatus';

function useTimeTileData(tileId: string): TileStatus & { data?: TimeTileData } {
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

const TimeTileContent = ({ tileData }: { tileData: TileStatus & { data?: TimeTileData } }) => {
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
          {data.currentTime}
        </div>
        <div className="text-sm text-theme-text-secondary">
          {data.timezone}
        </div>
      </div>
    );
  }

  return null;
};

export const TimeTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useTimeTileData(tile.id);
    
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        loading={tileData.loading}
        error={tileData.error}
        hasData={tileData.hasData}
        lastUpdate={tileData.data?.lastUpdate}
        {...rest}
      >
        <TimeTileContent tileData={tileData} />
      </GenericTile>
    );
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

TimeTile.displayName = 'TimeTile';
