import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';

const PreciousMetalsTileContent = ({ data }: { data: PreciousMetalsTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">
          ${data.gold.price}
        </div>
        <div className="text-sm text-theme-text-secondary">
          Gold Price
        </div>
      </div>
    );
  }
  return null;
};

export const PreciousMetalsTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getPreciousMetals } = usePreciousMetalsApi();
  const params = useMemo(() => ({ access_key: 'demo', base: 'USD', symbols: 'XAU' }), []);
  const { data, status, lastUpdated } = useTileData(getPreciousMetals, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <PreciousMetalsTileContent data={data} />
    </GenericTile>
  );
};

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
