import React from 'react';
import type { TimezoneInfoProps } from './types';

export const TimezoneInfo = React.memo<TimezoneInfoProps>(({ timeData, size }) => {
  const textSizeClass = size === 'large' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`${textSizeClass} text-theme-secondary font-medium`}>
        {timeData.abbreviation}
      </div>
      <div className={`${textSizeClass} text-theme-muted`}>UTC{timeData.offset}</div>
    </div>
  );
});

TimezoneInfo.displayName = 'TimezoneInfo';
