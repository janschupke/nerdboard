import React, { useState } from 'react';
import { useUraniumData } from './hooks/useUraniumData';
import { UraniumHeader } from './UraniumHeader';
import { UraniumChart } from './UraniumChart';
import { UraniumControls } from './UraniumControls';
import { UraniumMarketInfo } from './UraniumMarketInfo';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../GenericTile';
import type { UraniumTimeRange, UraniumTileConfig } from './types';

function isValidUraniumTileConfig(config: unknown): config is UraniumTileConfig {
  return Boolean(config && typeof config === 'object');
}

export const UraniumTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const configError = !isValidUraniumTileConfig(tile.config);
    const safeConfig: UraniumTileConfig = configError
      ? { timeRange: '1Y', refreshInterval: 0 }
      : (tile.config as UraniumTileConfig);

    const [timeRange, setTimeRange] = useState<UraniumTimeRange>(safeConfig.timeRange || '1Y');
    const { uraniumData, loading, error, refetch } = useUraniumData(
      timeRange,
      safeConfig.refreshInterval,
    );

    let content: React.ReactNode = null;
    if (configError) {
      content = (
        <div className="text-error-600 p-2">
          <span className="font-semibold">Tile Error:</span> Invalid or missing config for
          UraniumTile.
        </div>
      );
    } else if (loading) {
      const tileSize = typeof tile.size === 'string' ? tile.size : 'medium';
      content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
    } else if (error) {
      content = (
        <div className="p-4 text-center">
          <p className="text-error-600 mb-2">Error loading uranium data</p>
          <Button variant="primary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      );
    } else if (!uraniumData) {
      content = (
        <div className="p-4 text-center">
          <p className="text-theme-muted">No uranium data available</p>
        </div>
      );
    } else {
      const isLargeTile = tile.size === 'large';
      content = (
        <div className="space-y-4">
          {/* Header with current price and change */}
          <UraniumHeader uraniumData={uraniumData} size={tile.size} />

          {/* Chart section */}
          <div className="flex-1 min-h-0">
            <UraniumChart uraniumData={uraniumData} size={tile.size} />
          </div>

          {/* Controls for time range selection */}
          <UraniumControls
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            size={tile.size}
          />

          {/* Market information for large tiles */}
          {isLargeTile && <UraniumMarketInfo uraniumData={uraniumData} size={tile.size} />}

          {/* Last update info */}
          <div className="text-xs text-theme-muted text-center">
            Last update: {new Date(uraniumData.lastUpdated).toLocaleString()}
          </div>
        </div>
      );
    }

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        {content}
      </GenericTile>
    );
  },
);

UraniumTile.displayName = 'UraniumTile';
