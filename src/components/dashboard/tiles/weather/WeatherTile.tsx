import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import { WeatherHeader } from './WeatherHeader';
import { WeatherCurrent } from './WeatherCurrent';
import { WeatherForecast } from './WeatherForecast';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { WEATHER_CITIES } from './constants';
import type { WeatherTileProps } from './types';

export const WeatherTile = React.memo<WeatherTileProps>(({ size, config }) => {
  const { data, forecast, loading, error, refetch } = useWeatherData(
    config.city,
    config.refreshInterval,
  );

  // Get city configuration
  const cityConfig = WEATHER_CITIES[config.city.toUpperCase() as keyof typeof WEATHER_CITIES];
  const cityName = cityConfig?.name || config.city;
  const countryName = cityConfig?.country || '';

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{error}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WeatherHeader
        city={cityName}
        country={countryName}
        conditions={data.conditions}
        timestamp={data.timestamp}
      />

      <WeatherCurrent
        temperature={data.temperature}
        conditions={data.conditions}
        humidity={data.humidity}
        wind={data.wind}
      />

      {size === 'large' && <WeatherForecast forecast={forecast} />}
    </div>
  );
});

WeatherTile.displayName = 'WeatherTile';
