import React from 'react';
import { TileType } from '../../../types/dashboard';
import type { DashboardTile } from '../../../types/dashboard';
import type { TileMeta } from './GenericTile';

const lazyTileMap: Record<
  TileType,
  () => React.LazyExoticComponent<
    React.ComponentType<{ tile: DashboardTile; meta: TileMeta; [key: string]: unknown }>
  >
> = {
  [TileType.CRYPTOCURRENCY]: () =>
    React.lazy(() =>
      import('./cryptocurrency/CryptocurrencyTile').then((m) => ({
        default: m.CryptocurrencyTile,
      })),
    ),
  [TileType.PRECIOUS_METALS]: () =>
    React.lazy(() =>
      import('./precious-metals/PreciousMetalsTile').then((m) => ({
        default: m.PreciousMetalsTile,
      })),
    ),
  [TileType.FEDERAL_FUNDS_RATE]: () =>
    React.lazy(() =>
      import('./federal-funds-rate/FederalFundsRateTile').then((m) => ({
        default: m.FederalFundsRateTile,
      })),
    ),
  [TileType.EURIBOR_RATE]: () =>
    React.lazy(() =>
      import('./euribor-rate/EuriborRateTile').then((m) => ({ default: m.EuriborRateTile })),
    ),
  [TileType.WEATHER_HELSINKI]: () =>
    React.lazy(() => import('./weather/WeatherTile').then((m) => ({ default: m.WeatherTile }))),
  [TileType.WEATHER_PRAGUE]: () =>
    React.lazy(() => import('./weather/WeatherTile').then((m) => ({ default: m.WeatherTile }))),
  [TileType.WEATHER_TAIPEI]: () =>
    React.lazy(() => import('./weather/WeatherTile').then((m) => ({ default: m.WeatherTile }))),
  [TileType.GDX_ETF]: () =>
    React.lazy(() => import('./gdx-etf/GDXETFTile').then((m) => ({ default: m.GDXETFTile }))),
  [TileType.TIME_HELSINKI]: () =>
    React.lazy(() => import('./time/TimeTile').then((m) => ({ default: m.TimeTile }))),
  [TileType.TIME_PRAGUE]: () =>
    React.lazy(() => import('./time/TimeTile').then((m) => ({ default: m.TimeTile }))),
  [TileType.TIME_TAIPEI]: () =>
    React.lazy(() => import('./time/TimeTile').then((m) => ({ default: m.TimeTile }))),
  [TileType.URANIUM]: () =>
    React.lazy(() => import('./uranium/UraniumTile').then((m) => ({ default: m.UraniumTile }))),
};

export function getLazyTileComponent(
  type: TileType,
):
  | React.LazyExoticComponent<
      React.ComponentType<{ tile: DashboardTile; meta: TileMeta; [key: string]: unknown }>
    >
  | undefined {
  const loader = lazyTileMap[type];
  return loader ? loader() : undefined;
}
