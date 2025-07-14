import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta, type GenericTileDataHook } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import { useWeatherApi } from './useWeatherApi';
import type { WeatherData, WeatherApiResponse } from './types';

// Convert WeatherApiResponse to WeatherData
function convertWeatherData(apiResponse: WeatherApiResponse): WeatherData {
  const current = apiResponse.current;
  const weather = current.weather[0];
  
  return {
    city: 'Helsinki', // Default city, could be made configurable
    country: 'FI',
    temperature: {
      current: current.temp,
      feels_like: current.feels_like,
      min: apiResponse.daily[0]?.temp.min || current.temp,
      max: apiResponse.daily[0]?.temp.max || current.temp,
    },
    conditions: {
      main: weather.main,
      description: weather.description,
      icon: weather.icon,
    },
    humidity: current.humidity,
    wind: {
      speed: current.wind_speed,
      direction: current.wind_deg,
    },
    pressure: current.pressure,
    visibility: current.visibility,
    timestamp: current.dt,
  };
}

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
    getWeather(tileId, { lat: 60.1699, lon: 24.9384 })
      .then((apiResponse) => {
        if (!mounted) return;
        const weatherData = convertWeatherData(apiResponse);
        setData(weatherData);
        setHasData(!!weatherData && !!weatherData.temperature);
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
      <GenericTile<WeatherData>
        tile={tile}
        meta={meta}
        useTileData={useWeatherTileData}
        {...rest}
      />
    );
  },
);

WeatherTile.displayName = 'WeatherTile';
