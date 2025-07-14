import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import { WeatherHeader } from './WeatherHeader';
import { WeatherCurrent } from './WeatherCurrent';
import { WeatherForecast } from './WeatherForecast';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import { WEATHER_CITIES } from './constants';
import type { WeatherTileProps } from './types';
import { TileType } from '../../../../types/dashboard';
import { weatherTileMeta } from './meta';

function isValidWeatherTileConfig(config: unknown): config is WeatherTileProps['config'] {
  return Boolean(
    config &&
      typeof config === 'object' &&
      typeof (config as Record<string, unknown>).city === 'string' &&
      typeof (config as Record<string, unknown>).country === 'string',
  );
}

export const WeatherTile = React.memo<WeatherTileProps>(({ size, config, ...rest }) => {
  const configError = !isValidWeatherTileConfig(config);
  const safeConfig: WeatherTileProps['config'] = configError
    ? { city: '', country: '', refreshInterval: 0 }
    : config;

  const { data, forecast, loading, error, refetch } = useWeatherData(
    safeConfig.city,
    safeConfig.refreshInterval,
  );

  // Get city configuration
  const cityConfig = WEATHER_CITIES[safeConfig.city.toUpperCase?.() as keyof typeof WEATHER_CITIES];
  const cityName = cityConfig?.name || safeConfig.city;
  const countryName = cityConfig?.country || '';

  let content: React.ReactNode = null;
  if (configError) {
    content = (
      <div className="text-error-600 p-2">
        <span className="font-semibold">Tile Error:</span> Invalid or missing config for
        WeatherTile.
      </div>
    );
  } else if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  } else if (error) {
    content = (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{error}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  } else if (!data) {
    content = (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No weather data available</p>
      </div>
    );
  } else {
    content = (
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
  }

  const cityTypeMap: Record<string, TileType> = {
    helsinki: TileType.WEATHER_HELSINKI,
    prague: TileType.WEATHER_PRAGUE,
    taipei: TileType.WEATHER_TAIPEI,
  };
  const tileType = cityTypeMap[safeConfig.city.toLowerCase?.()] || TileType.WEATHER_HELSINKI;
  return (
    <GenericTile
      tile={{
        id: `weather-${safeConfig.city}`,
        type: tileType,
        size: size || 'medium',
        config: safeConfig as unknown as Record<string, unknown>,
        position: { x: 0, y: 0 },
      }}
      meta={weatherTileMeta(cityName)}
      {...rest}
    >
      {content}
    </GenericTile>
  );
});

WeatherTile.displayName = 'WeatherTile';
