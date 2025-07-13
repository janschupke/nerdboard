import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import { TEMPERATURE_CONFIG } from './constants';
import type { WeatherForecastProps } from './types';

export const WeatherForecast = React.memo<WeatherForecastProps>(({ forecast }) => {
  const formatTemperature = (temp: number): string => {
    return `${Math.round(temp)}${TEMPERATURE_CONFIG.CELSIUS_SYMBOL}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-theme-primary mb-2">5-Day Forecast</h4>
      <div className="space-y-2">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between p-2 bg-theme-tertiary rounded"
          >
            <div className="flex items-center space-x-2">
              <WeatherIcon condition={day.conditions.icon} size="sm" />
              <div className="text-xs">
                <div className="text-theme-primary font-medium">{formatDate(day.date)}</div>
                <div className="text-theme-secondary capitalize">{day.conditions.description}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-theme-primary font-medium">
                {formatTemperature(day.temperature.max)}
              </div>
              <div className="text-theme-muted">{formatTemperature(day.temperature.min)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

WeatherForecast.displayName = 'WeatherForecast';
