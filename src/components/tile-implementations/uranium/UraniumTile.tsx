import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import { useTileData } from '../../tile/useTileData';

const UraniumTileContent = ({ data, status }: { data: UraniumTileData | null; status: typeof RequestStatus[keyof typeof RequestStatus] }) => {
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
  if (status === RequestStatus.Success && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          ${data.spotPrice}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Uranium Price
        </div>
      </div>
    );
  }
  return null;
};

export const UraniumTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getUraniumPrice } = useUraniumApi();
  const { data, status, lastUpdated } = useTileData(getUraniumPrice, tile.id, { range: '1D' }, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <UraniumTileContent data={data} status={status} />
    </GenericTile>
  );
};

UraniumTile.displayName = 'UraniumTile';
