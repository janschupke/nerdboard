import React, { useState } from 'react';
import { useTimeData } from './hooks/useTimeData';
import { TimeDisplay } from './TimeDisplay';
import { TimezoneInfo } from './TimezoneInfo';
import { BusinessHours } from './BusinessHours';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../../generic-tile/GenericTile';
import { TIME_UI_CONFIG, TIME_ERROR_MESSAGES } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import type { TimeTileConfig, TimeFormat, TimeData } from './types';
import { timeTileMeta } from './meta';

function isValidTimeTileConfig(config: unknown): config is TimeTileConfig {
  return Boolean(
    config && typeof config === 'object' && typeof (config as { city?: unknown }).city === 'string',
  );
}

export const TimeTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          Time
        </div>
      </GenericTile>
    );
  },
);

TimeTile.displayName = 'TimeTile';
