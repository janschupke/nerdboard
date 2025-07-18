import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const TimeTileContent = ({ data }: { data: TimeTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.currentTime}</div>
        <div className="text-sm text-theme-text-secondary">{data.date}</div>
      </div>
    );
  }
  return null;
};

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getTime } = useTimeApi();
  const params = useMemo(() => ({ city: 'Europe/Helsinki' }), []);
  const { data, status, lastUpdated } = useTileData(getTime, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <TimeTileContent data={data} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
