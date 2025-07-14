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

function isValidTimeTileConfig(config: unknown): config is TimeTileConfig {
  return Boolean(
    config && typeof config === 'object' && typeof (config as { city?: unknown }).city === 'string',
  );
}

export const TimeTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const configError: boolean = !isValidTimeTileConfig(tile.config);
    const safeConfig: TimeTileConfig = configError
      ? { city: 'helsinki', timeFormat: '24-hour', showBusinessHours: false, refreshInterval: 0 }
      : (tile.config as unknown as TimeTileConfig);

    let content: React.ReactNode = null;
    let hookError: Error | null = null;
    let timeFormat: TimeFormat = safeConfig.timeFormat || TIME_UI_CONFIG.DEFAULT_TIME_FORMAT;
    let setTimeFormat: React.Dispatch<React.SetStateAction<TimeFormat>> = () => {};
    let timeData: TimeData | null = null;
    let loading: boolean = false;
    let error: string | null = null;
    let refetch: () => void = () => {};

    try {
      // Only call hooks if config is valid
      if (!configError) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        [timeFormat, setTimeFormat] = useState<TimeFormat>(
          safeConfig.timeFormat || TIME_UI_CONFIG.DEFAULT_TIME_FORMAT,
        );
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ({ timeData, loading, error, refetch } = useTimeData(
          safeConfig.city,
          safeConfig.refreshInterval,
        ));
      }
    } catch (err) {
      hookError = err instanceof Error ? err : new Error(String(err));
    }

    if (configError) {
      content = (
        <div className="text-error-600 p-2">
          <span className="font-semibold">Tile Error:</span> Invalid or missing config for TimeTile.
        </div>
      );
    } else if (hookError) {
      content = (
        <div className="text-error-600 p-2">
          <span className="font-semibold">Tile Error:</span> {hookError.message}
        </div>
      );
    } else if (loading) {
      const tileSize = typeof tile.size === 'string' ? tile.size : 'medium';
      content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
    } else if (error) {
      content = (
        <div className="p-4 text-center">
          <p className="text-error-600 mb-2">{TIME_ERROR_MESSAGES.TIMEZONE_ERROR}</p>
          <Button variant="primary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      );
    } else if (!timeData) {
      content = (
        <div className="p-4 text-center">
          <p className="text-theme-muted">No time data available</p>
        </div>
      );
    } else {
      const isLargeTile = tile.size === 'large';
      content = (
        <div className="space-y-4">
          {/* Header with city name and time format toggle */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-theme-primary">
              {timeData.timezone.split('/')[1]?.replace('_', ' ') || safeConfig.city}
            </h3>
            <button
              onClick={() => setTimeFormat(timeFormat === '24-hour' ? '12-hour' : '24-hour')}
              className="px-2 py-1 text-xs rounded bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary transition-colors"
              aria-label={`Switch to ${timeFormat === '24-hour' ? '12-hour' : '24-hour'} format`}
            >
              {timeFormat === '24-hour' ? '12H' : '24H'}
            </button>
          </div>

          {/* Main time display */}
          <div className="flex justify-center">
            <TimeDisplay timeData={timeData} timeFormat={timeFormat} size={tile.size} />
          </div>

          {/* Timezone and business hours info */}
          <div className="flex justify-between items-center">
            <TimezoneInfo timeData={timeData} size={tile.size} />
            {safeConfig.showBusinessHours !== false && (
              <BusinessHours timeData={timeData} size={tile.size} />
            )}
          </div>

          {/* Last update info for large tiles */}
          {isLargeTile && (
            <div className="text-xs text-theme-muted text-center">
              Last update: {new Date(timeData.lastUpdate).toLocaleTimeString()}
            </div>
          )}
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

TimeTile.displayName = 'TimeTile';
