import React from 'react';
import { GenericTile } from '../../generic-tile/GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import { uraniumTileMeta } from './meta';

export const UraniumTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          {uraniumTileMeta.title}
        </div>
      </GenericTile>
    );
  },
);

UraniumTile.displayName = 'UraniumTile';
