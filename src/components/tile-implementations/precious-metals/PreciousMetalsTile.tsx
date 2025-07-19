import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { PriceDisplay } from '../../ui/PriceDisplay';

const PreciousMetalsTileContent = ({ data }: { data: PreciousMetalsTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1 border-b border-theme-secondary">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-xs text-theme-tertiary w-4 text-right">1</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-theme-primary">Gold</div>
                  <div className="text-xs text-theme-tertiary uppercase">XAU</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <PriceDisplay price={data.gold.price} currency="USD" className="text-xs" />
                <div className="text-xs text-theme-tertiary">
                  {data.gold.change_percentage_24h >= 0 ? '+' : ''}
                  {data.gold.change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-xs text-theme-tertiary w-4 text-right">2</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-theme-primary">Silver</div>
                  <div className="text-xs text-theme-tertiary uppercase">XAG</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <PriceDisplay price={data.silver.price} currency="USD" className="text-xs" />
                <div className="text-xs text-theme-tertiary">
                  {data.silver.change_percentage_24h >= 0 ? '+' : ''}
                  {data.silver.change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PreciousMetalsTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getPreciousMetals } = usePreciousMetalsApi();
  const params = useMemo(() => ({ symbol: 'XAU' }), []);
  const { data, status, lastUpdated } = useTileData(
    getPreciousMetals,
    tile.id,
    params,
    isForceRefresh,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <PreciousMetalsTileContent data={data} />
    </GenericTile>
  );
};

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
