import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const UraniumTileContent = ({ data }: { data: UraniumTileData | null }) => {
  if (data) {
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
  const params = useMemo(() => ({ range: '1D' }), []);
  const { data, status, lastUpdated } = useTileData(getUraniumPrice, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <UraniumTileContent data={data} />
    </GenericTile>
  );
};

UraniumTile.displayName = 'UraniumTile';
