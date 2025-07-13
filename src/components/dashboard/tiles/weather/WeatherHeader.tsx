import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import type { WeatherHeaderProps } from './types';

export const WeatherHeader = React.memo<WeatherHeaderProps>(
  ({ city, country, conditions, timestamp }) => {
    const formatTimestamp = (timestamp: number): string => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <WeatherIcon condition={conditions.icon} size="md" />
          <div>
            <h3 className="font-medium text-theme-primary text-sm">
              {city}, {country}
            </h3>
            <p className="text-theme-secondary text-xs capitalize">{conditions.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-theme-muted text-xs">Updated: {formatTimestamp(timestamp)}</p>
        </div>
      </div>
    );
  },
);

WeatherHeader.displayName = 'WeatherHeader';
