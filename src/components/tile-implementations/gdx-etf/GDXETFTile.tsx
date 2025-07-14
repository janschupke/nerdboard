import React from 'react';
import { GenericTile } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import type { TileMeta } from '../../tile/GenericTile';
import { gdxEtfTileMeta } from './meta';

export const GDXETFTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          {gdxEtfTileMeta.title}
        </div>
      </GenericTile>
    );
  },
);
