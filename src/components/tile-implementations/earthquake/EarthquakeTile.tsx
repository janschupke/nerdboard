import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEarthquakeApi } from './useEarthquakeApi';
import type { EarthquakeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import { useTileData } from '../../tile/useTileData';

const EarthquakeTileContent = ({ data, status }: { data: EarthquakeTileData[] | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
  if (status === RequestStatus.Loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }
  if (status === RequestStatus.Error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }
  if (status === RequestStatus.Stale) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }
  if (status === RequestStatus.Success && data && data.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          {data.length}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Recent earthquakes
        </div>
      </div>
    );
  }
  return null;
};

export const EarthquakeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getEarthquakes } = useEarthquakeApi();
  const { data, status, lastUpdated } = useTileData(getEarthquakes, tile.id, { days: 7 }, isForceRefresh);
  // Use the time of the first earthquake as lastUpdate if available
  const lastUpdate = data && data.length > 0 ? new Date(data[0].time).toISOString() : (lastUpdated ? lastUpdated.toISOString() : undefined);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdate}
      {...rest}
    >
      <EarthquakeTileContent data={data as EarthquakeTileData[] | null} status={status} />
    </GenericTile>
  );
};

EarthquakeTile.displayName = 'EarthquakeTile';
