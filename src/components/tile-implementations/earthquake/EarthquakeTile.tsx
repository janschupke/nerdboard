import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEarthquakeApi } from './useEarthquakeApi';
import type { EarthquakeTileDataArray } from './useEarthquakeApi';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const EarthquakeTileContent = ({ data }: { data: EarthquakeTileDataArray | null }) => {
  if (data && data.items.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.items.length}</div>
        <div className="text-sm text-theme-text-secondary">Recent earthquakes</div>
      </div>
    );
  }
  return null;
};

export const EarthquakeTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getEarthquakes } = useEarthquakeApi();
  const params = useMemo(() => ({ days: 7 }), []);
  const { data, status, lastUpdated } = useTileData(
    getEarthquakes,
    tile.id,
    params,
    isForceRefresh,
  );
  // Use the time of the first earthquake as lastUpdate if available
  const lastUpdate =
    data && data.items.length > 0
      ? new Date(data.items[0].time).toISOString()
      : lastUpdated
        ? lastUpdated.toISOString()
        : undefined;
  return (
    <GenericTile tile={tile} meta={meta} status={status} lastUpdate={lastUpdate} {...rest}>
      <EarthquakeTileContent data={data} />
    </GenericTile>
  );
};

EarthquakeTile.displayName = 'EarthquakeTile';
