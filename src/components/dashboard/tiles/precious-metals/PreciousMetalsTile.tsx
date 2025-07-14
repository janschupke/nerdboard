import React from 'react';
import { GenericTile } from '../../generic-tile/GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import { preciousMetalsTileMeta } from './meta';

export const PreciousMetalsTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          {preciousMetalsTileMeta.title}
        </div>
      </GenericTile>
    );
  },
);

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
