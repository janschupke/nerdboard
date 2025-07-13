import React, { useState } from 'react';
import { useTimeData } from './hooks/useTimeData';
import { TimeDisplay } from './TimeDisplay';
import { TimezoneInfo } from './TimezoneInfo';
import { BusinessHours } from './BusinessHours';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { TIME_UI_CONFIG, TIME_ERROR_MESSAGES } from './constants';
import type { TimeTileProps, TimeFormat } from './types';

export const TimeTile = React.memo<TimeTileProps>(({ size, config }) => {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(
    config.timeFormat || TIME_UI_CONFIG.DEFAULT_TIME_FORMAT,
  );

  const { timeData, loading, error, refetch } = useTimeData(
    config.city,
    config.refreshInterval,
  );

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{TIME_ERROR_MESSAGES.TIMEZONE_ERROR}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!timeData) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No time data available</p>
      </div>
    );
  }

  const isLargeTile = size === 'large';

  return (
    <div className="space-y-4">
      {/* Header with city name and time format toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-theme-primary">
          {timeData.timezone.split('/')[1]?.replace('_', ' ') || config.city}
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
        <TimeDisplay timeData={timeData} timeFormat={timeFormat} size={size} />
      </div>

      {/* Timezone and business hours info */}
      <div className="flex justify-between items-center">
        <TimezoneInfo timeData={timeData} size={size} />
        {config.showBusinessHours !== false && (
          <BusinessHours timeData={timeData} size={size} />
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
});

TimeTile.displayName = 'TimeTile'; 
