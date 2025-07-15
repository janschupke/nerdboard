import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useWeatherApi } from './useWeatherApi';
import { DataFetcher } from '../../../services/dataFetcher';
import type { WeatherData, WeatherApiResponse } from './types';

function useWeatherTileData(tileId: string): ReturnType<GenericTileDataHook<WeatherData>> {
  const { getWeather } = useWeatherApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<WeatherData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    DataFetcher.fetchAndMap<'weather', WeatherApiResponse, WeatherData>(
      () => getWeather(tileId, { lat: 60.1699, lon: 24.9384 }),
      tileId,
      'weather',
      { apiCall: 'Weather API' },
    )
      .then((result) => {
        if (!mounted) return;
        setData(result.data as WeatherData);
        setHasData(!!result.data && !!(result.data as WeatherData).temperature);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Error');
        setHasData(false);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tileId, getWeather]);
  return { loading, error, hasData, data };
}

export const WeatherTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DashboardTile; meta: TileMeta }) => {
    return <GenericTile tile={tile} meta={meta} useTileData={useWeatherTileData} {...rest} />;
  },
);

WeatherTile.displayName = 'WeatherTile';
