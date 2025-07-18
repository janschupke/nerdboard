import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';

export const GDXETFTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getGDXETF } = useGdxEtfApi();
  const { data, status, lastUpdated } = useTileData(getGDXETF, tile.id, { function: 'GLOBAL_QUOTE', symbol: 'GDX', apikey: 'demo' }, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <GDXETFTileContent data={data} status={status} />
    </GenericTile>
  );
};

GDXETFTile.displayName = 'GDXETFTile';
