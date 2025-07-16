import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useWeatherTileData(tileId: string): { loading: boolean; error: string | null; hasData: boolean; data?: WeatherTileData } {
  const { getWeather } = useWeatherApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeatherTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getWeather(tileId, { lat: 60.1699, lon: 24.9384 }, isForceRefresh)
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setData(undefined);
        setError(err?.message || 'Error');
        setLoading(false);
      });
  }, [tileId, getWeather, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const WeatherTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useWeatherTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

WeatherTile.displayName = 'WeatherTile';
