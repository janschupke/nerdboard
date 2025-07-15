import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherTileData } from './types';

function useWeatherTileData(
  tileId: string,
  refreshKey?: number,
): ReturnType<GenericTileDataHook<WeatherTileData>> {
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
    getWeather(tileId, { lat: 60.1699, lon: 24.9384 })
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
  }, [tileId, getWeather, refreshKey]);
  return { loading, error, hasData, data };
}

export const WeatherTile = React.memo(
  ({
    tile,
    meta,
    refreshKey,
    ...rest
  }: {
    tile: DragboardTileData;
    meta: TileMeta;
    refreshKey?: number;
  }) => {
    // Call the hook at the top level
    const tileData = useWeatherTileData(tile.id, refreshKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

WeatherTile.displayName = 'WeatherTile';
