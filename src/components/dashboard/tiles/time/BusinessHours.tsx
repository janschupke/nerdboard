import React from 'react';
import { BUSINESS_STATUS } from './constants';
import type { BusinessHoursProps } from './types';

export const BusinessHours = React.memo<BusinessHoursProps>(({ timeData, size }) => {
  const textSizeClass = size === 'large' ? 'text-sm' : 'text-xs';

  const getStatusColor = (status: string) => {
    switch (status) {
      case BUSINESS_STATUS.OPEN:
        return 'text-success-600 bg-success-100';
      case BUSINESS_STATUS.CLOSED:
        return 'text-error-600 bg-error-100';
      case BUSINESS_STATUS.SOON:
        return 'text-warning-600 bg-warning-100';
      case BUSINESS_STATUS.CLOSING:
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-theme-muted bg-theme-tertiary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case BUSINESS_STATUS.OPEN:
        return 'Open';
      case BUSINESS_STATUS.CLOSED:
        return 'Closed';
      case BUSINESS_STATUS.SOON:
        return 'Opening Soon';
      case BUSINESS_STATUS.CLOSING:
        return 'Closing Soon';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(timeData.businessStatus)}`}>
        {getStatusText(timeData.businessStatus)}
      </div>
      {timeData.businessStatus === BUSINESS_STATUS.CLOSED && timeData.timeUntilNextDay && (
        <div className={`${textSizeClass} text-theme-muted text-center`}>
          Opens in {timeData.timeUntilNextDay}
        </div>
      )}
    </div>
  );
});

BusinessHours.displayName = 'BusinessHours'; 
