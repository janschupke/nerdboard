import React from 'react';
import { TEMPERATURE_CONFIG } from './constants';
import { WeatherIcon } from './WeatherIcon';
import type { WeatherCurrentProps } from './types';

export const WeatherCurrent = React.memo<WeatherCurrentProps>(
  ({ temperature, conditions, humidity, wind }) => {
    const formatTemperature = (temp: number): string => {
      return `${Math.round(temp)}${TEMPERATURE_CONFIG.CELSIUS_SYMBOL}`;
    };

    const formatWindDirection = (degrees: number): string => {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    };

    return (
      <div className="space-y-3">
        {/* Temperature Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <WeatherIcon condition={conditions.icon} size="lg" />
            <div className="text-3xl font-bold text-theme-primary">
              {formatTemperature(temperature.current)}
            </div>
          </div>
          <div className="text-sm text-theme-secondary">
            Feels like {formatTemperature(temperature.feels_like)}
          </div>
          <div className="text-xs text-theme-muted mt-1">
            {formatTemperature(temperature.min)} / {formatTemperature(temperature.max)}
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-theme-tertiary rounded p-2">
            <div className="text-theme-muted mb-1">Humidity</div>
            <div className="font-medium text-theme-primary">{humidity}%</div>
          </div>
          <div className="bg-theme-tertiary rounded p-2">
            <div className="text-theme-muted mb-1">Wind</div>
            <div className="font-medium text-theme-primary">
              {Math.round(wind.speed)} km/h {formatWindDirection(wind.direction)}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

WeatherCurrent.displayName = 'WeatherCurrent';
