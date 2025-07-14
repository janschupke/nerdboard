import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import { WeatherHeader } from './WeatherHeader';
import { WeatherCurrent } from './WeatherCurrent';
import { WeatherForecast } from './WeatherForecast';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../../generic-tile/GenericTile';
import { WEATHER_CITIES } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';

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
    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full text-lg font-semibold">
          Weather
        </div>
      </GenericTile>
    );
  },
);

WeatherTile.displayName = 'WeatherTile';
