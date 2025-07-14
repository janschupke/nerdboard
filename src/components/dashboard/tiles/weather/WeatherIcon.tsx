import React from 'react';
import { WEATHER_ICONS } from './constants';
import type { WeatherIconProps } from './types';

export const WeatherIcon = React.memo<WeatherIconProps>(({ condition, size = 'md' }) => {
  const icon = WEATHER_ICONS[condition as keyof typeof WEATHER_ICONS] || '🌤️';

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span
      className={`${sizeClasses[size]} inline-block`}
      role="img"
      aria-label={`Weather condition: ${condition}`}
    >
      {icon}
    </span>
  );
});

WeatherIcon.displayName = 'WeatherIcon';
