import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import { WeatherHeader } from './WeatherHeader';
import { WeatherCurrent } from './WeatherCurrent';
import { WeatherForecast } from './WeatherForecast';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import { WEATHER_CITIES } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../GenericTile';

function isValidWeatherTileConfig(config: unknown): config is Record<string, unknown> {
  return Boolean(
    config &&
      typeof config === 'object' &&
      typeof (config as Record<string, unknown>).city === 'string' &&
      typeof (config as Record<string, unknown>).country === 'string',
  );
}

export const WeatherTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const configError = !isValidWeatherTileConfig(tile.config);
    const safeConfig = configError
      ? { city: '', country: '', refreshInterval: 0 }
      : (tile.config as Record<string, unknown>);

    const { data, forecast, loading, error, refetch } = useWeatherData(
      safeConfig.city as string,
      safeConfig.refreshInterval as number,
    );

    // Get city configuration
    const cityConfig = WEATHER_CITIES[(safeConfig.city as string)?.toUpperCase?.() as keyof typeof WEATHER_CITIES];
    const cityName = cityConfig?.name || (safeConfig.city as string);
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
      const tileSize = typeof tile.size === 'string' ? tile.size : 'medium';
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

          {tile.size === 'large' && <WeatherForecast forecast={forecast} />}
        </div>
      );
    }

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        {content}
      </GenericTile>
    );
  },
);

WeatherTile.displayName = 'WeatherTile';
