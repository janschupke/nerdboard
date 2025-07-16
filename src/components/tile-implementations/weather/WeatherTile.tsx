import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useWeatherTileData(tileId: string): ReturnType<GenericTileDataHook<WeatherTileData>> {
  const { getWeather } = useWeatherApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState<WeatherTileData | undefined>(undefined);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setHasData(false);
    setData(undefined);

    getWeather(tileId, { lat: 60.1699, lon: 24.9384 }, isForceRefresh)
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
  }, [tileId, getWeather, isForceRefresh]);
  return { loading, error, hasData, data };
}

export const WeatherTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    // Call the hook at the top level
    const tileData = useWeatherTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

WeatherTile.displayName = 'WeatherTile';
