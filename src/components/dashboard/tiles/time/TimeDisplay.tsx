import React from 'react';
import { TimezoneService } from './services/timezoneService';
import type { TimeDisplayProps } from './types';

export const TimeDisplay = React.memo<TimeDisplayProps>(({ timeData, timeFormat, size }) => {
  const timezoneService = React.useMemo(() => TimezoneService.getInstance(), []);

  const formattedTime = React.useMemo(() => {
    return timezoneService.formatTime(timeData.currentTime, timeFormat);
  }, [timezoneService, timeData.currentTime, timeFormat]);

  const timeSizeClass = size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-xl';
  const labelSizeClass = size === 'large' ? 'text-sm' : 'text-xs';

  return (
    <div className="text-center">
      <div className={`font-mono font-bold ${timeSizeClass} text-theme-primary`}>
        {formattedTime}
      </div>
      <div className={`${labelSizeClass} text-theme-muted mt-1`}>
        {timeData.dayOfWeek}, {timeData.date}
      </div>
    </div>
  );
});

TimeDisplay.displayName = 'TimeDisplay';
