import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherTileData } from './types';

function useWeatherTileData(tileId: string): ReturnType<GenericTileDataHook<WeatherTileData>> {
  const { getWeather } = useWeatherApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<WeatherTileData | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);
    getWeather(tileId, { city: 'helsinki' })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setHasData(!!result && !!result.weather);
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
    return (
      <GenericTile
        tile={tile}
        meta={meta}
        id={tile.id}
        position={tile.position}
        size={tile.size}
        useTileData={useWeatherTileData}
        {...rest}
      />
    );
  },
);

WeatherTile.displayName = 'WeatherTile';
