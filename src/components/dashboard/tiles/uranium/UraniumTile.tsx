import React, { useState } from 'react';
import { useUraniumData } from './hooks/useUraniumData';
import { UraniumHeader } from './UraniumHeader';
import { UraniumChart } from './UraniumChart';
import { UraniumControls } from './UraniumControls';
import { UraniumMarketInfo } from './UraniumMarketInfo';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { URANIUM_ERROR_MESSAGES } from './constants';
import type { UraniumTileProps, UraniumTimeRange } from './types';

export const UraniumTile = React.memo<UraniumTileProps>(({ size, config }) => {
  const [timeRange, setTimeRange] = useState<UraniumTimeRange>(config.timeRange || '1Y');

  const { uraniumData, loading, error, refetch } = useUraniumData(
    timeRange,
    config.refreshInterval,
  );

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{URANIUM_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!uraniumData) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">{URANIUM_ERROR_MESSAGES.NO_DATA}</p>
      </div>
    );
  }

  const isLargeTile = size === 'large';

  return (
    <div className="space-y-4">
      {/* Header with current price and change */}
      <UraniumHeader uraniumData={uraniumData} size={size} />

      {/* Chart section */}
      <div className="flex-1 min-h-0">
        <UraniumChart uraniumData={uraniumData} size={size} />
      </div>

      {/* Controls for time range selection */}
      <UraniumControls timeRange={timeRange} onTimeRangeChange={setTimeRange} size={size} />

      {/* Market information for large tiles */}
      {isLargeTile && <UraniumMarketInfo uraniumData={uraniumData} size={size} />}

      {/* Last update info */}
      <div className="text-xs text-theme-muted text-center">
        Last update: {new Date(uraniumData.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
});

UraniumTile.displayName = 'UraniumTile';
