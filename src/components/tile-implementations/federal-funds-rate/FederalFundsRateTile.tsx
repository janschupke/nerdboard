import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useFederalFundsApi } from './useFederalFundsApi';
import type { FederalFundsRateTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const FederalFundsRateTileContent = ({ data }: { data: FederalFundsRateTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.currentRate}%</div>
        <div className="text-sm text-theme-text-secondary">Federal Funds Rate</div>
      </div>
    );
  }
  return null;
};

export const FederalFundsRateTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getFederalFundsRate } = useFederalFundsApi();
  const params = useMemo(
    () => ({ series_id: 'FEDFUNDS' as const, file_type: 'json' as const }),
    [],
  );
  const { data, status, lastUpdated } = useTileData(
    getFederalFundsRate,
    tile.id,
    params,
    isForceRefresh,
  );
  let lastUpdate: string | undefined = undefined;
  if (data?.lastUpdate) {
    lastUpdate =
      typeof data.lastUpdate === 'string' ? data.lastUpdate : data.lastUpdate.toISOString();
  } else if (lastUpdated) {
    lastUpdate = lastUpdated.toISOString();
  }
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdate}
      data={data}
      {...rest}
    >
      <FederalFundsRateTileContent data={data} />
    </GenericTile>
  );
};

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
