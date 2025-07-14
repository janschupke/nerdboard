import React, { useState } from 'react';
import { useUraniumData } from './hooks/useUraniumData';
import { UraniumHeader } from './UraniumHeader';
import { UraniumChart } from './UraniumChart';
import { UraniumControls } from './UraniumControls';
import { UraniumMarketInfo } from './UraniumMarketInfo';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../../generic-tile/GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import type { UraniumTimeRange, UraniumTileConfig } from './types';
import { uraniumTileMeta } from './meta';

function isValidUraniumTileConfig(config: unknown): config is UraniumTileConfig {
  return Boolean(config && typeof config === 'object');
}

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
