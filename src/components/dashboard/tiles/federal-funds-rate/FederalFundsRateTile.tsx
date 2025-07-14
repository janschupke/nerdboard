import React, { useMemo } from 'react';
import { useFederalFundsRateData } from './hooks/useFederalFundsRateData';
import { ChartComponent } from '../../generic-tile/ChartComponent';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../../generic-tile/GenericTile';
import { FEDERAL_FUNDS_UI_CONFIG, TIME_RANGE_CONFIG } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import type { FederalFundsRateTileConfig } from './types';
import { federalFundsRateTileMeta } from './meta';

function isValidFederalFundsRateTileConfig(config: unknown): config is FederalFundsRateTileConfig {
  return Boolean(config && typeof config === 'object');
}

export const FederalFundsRateTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          {federalFundsRateTileMeta.title}
        </div>
      </GenericTile>
    );
  },
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
