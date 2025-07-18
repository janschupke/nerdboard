import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { useMemo } from 'react';

const GDXETFTileContent = ({ data }: { data: GdxEtfTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">${data.currentPrice}</div>
        <div className="text-sm text-theme-text-secondary">{data.symbol}</div>
      </div>
    );
  }
  return null;
};

export const GDXETFTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getGDXETF } = useGdxEtfApi();
  const params = useMemo<AlphaVantageParams>(
    () => ({
      function: 'GLOBAL_QUOTE',
      symbol: 'GDX',
      apikey: import.meta.env.ALPHA_VANTAGE_API_KEY,
    }),
    [],
  );
  const { data, status, lastUpdated } = useTileData(getGDXETF, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <GDXETFTileContent data={data} />
    </GenericTile>
  );
};

GDXETFTile.displayName = 'GDXETFTile';
