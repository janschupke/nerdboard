import React from 'react';
import { TileType } from '../dragboard/dashboard';
import type { DashboardTile } from '../dragboard/dashboard';
import type { TileMeta } from './GenericTile';
import { cryptocurrencyTileMeta } from '../tile-implementations/cryptocurrency/meta';
import { preciousMetalsTileMeta } from '../tile-implementations/precious-metals/meta';
import { federalFundsRateTileMeta } from '../tile-implementations/federal-funds-rate/meta';
import { gdxEtfTileMeta } from '../tile-implementations/gdx-etf/meta';
import { uraniumTileMeta } from '../tile-implementations/uranium/meta';
import { timeTileMeta } from '../tile-implementations/time/meta';
import { weatherTileMeta } from '../tile-implementations/weather/meta';

// Inline meta for EuriborRateTile
const euriborRateTileMeta = { title: 'Euribor Rate', icon: 'chart' };

export interface TileCatalogEntry {
  type: TileType;
  getLazyComponent: () => React.LazyExoticComponent<
    React.ComponentType<{ tile: DashboardTile; meta: TileMeta; [key: string]: unknown }>
  >;
  meta?: TileMeta; // For static meta
  getMeta?: () => TileMeta; // For dynamic meta (e.g. city)
}

export const TILE_CATALOG: TileCatalogEntry[] = [
  {
    type: TileType.CRYPTOCURRENCY,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/cryptocurrency/CryptocurrencyTile').then((m) => ({
          default: m.CryptocurrencyTile,
        })),
      ),
    meta: cryptocurrencyTileMeta,
  },
  {
    type: TileType.PRECIOUS_METALS,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/precious-metals/PreciousMetalsTile').then((m) => ({
          default: m.PreciousMetalsTile,
        })),
      ),
    meta: preciousMetalsTileMeta,
  },
  {
    type: TileType.FEDERAL_FUNDS_RATE,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/federal-funds-rate/FederalFundsRateTile').then((m) => ({
          default: m.FederalFundsRateTile,
        })),
      ),
    meta: federalFundsRateTileMeta,
  },
  {
    type: TileType.EURIBOR_RATE,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/euribor-rate/EuriborRateTile').then((m) => ({
          default: m.EuriborRateTile,
        })),
      ),
    meta: euriborRateTileMeta,
  },
  {
    type: TileType.WEATHER_HELSINKI,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/weather/WeatherTile').then((m) => ({ default: m.WeatherTile })),
      ),
    getMeta: () => weatherTileMeta('Helsinki'),
  },
  {
    type: TileType.WEATHER_PRAGUE,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/weather/WeatherTile').then((m) => ({ default: m.WeatherTile })),
      ),
    getMeta: () => weatherTileMeta('Prague'),
  },
  {
    type: TileType.WEATHER_TAIPEI,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/weather/WeatherTile').then((m) => ({ default: m.WeatherTile })),
      ),
    getMeta: () => weatherTileMeta('Taipei'),
  },
  {
    type: TileType.GDX_ETF,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/gdx-etf/GDXETFTile').then((m) => ({ default: m.GDXETFTile })),
      ),
    meta: gdxEtfTileMeta,
  },
  {
    type: TileType.TIME_HELSINKI,
    getLazyComponent: () =>
      React.lazy(() => import('../tile-implementations/time/TimeTile').then((m) => ({ default: m.TimeTile }))),
    getMeta: () => timeTileMeta('Helsinki'),
  },
  {
    type: TileType.TIME_PRAGUE,
    getLazyComponent: () =>
      React.lazy(() => import('../tile-implementations/time/TimeTile').then((m) => ({ default: m.TimeTile }))),
    getMeta: () => timeTileMeta('Prague'),
  },
  {
    type: TileType.TIME_TAIPEI,
    getLazyComponent: () =>
      React.lazy(() => import('../tile-implementations/time/TimeTile').then((m) => ({ default: m.TimeTile }))),
    getMeta: () => timeTileMeta('Taipei'),
  },
  {
    type: TileType.URANIUM,
    getLazyComponent: () =>
      React.lazy(() =>
        import('../tile-implementations/uranium/UraniumTile').then((m) => ({ default: m.UraniumTile })),
      ),
    meta: uraniumTileMeta,
  },
];

export function getLazyTileComponent(type: TileType) {
  const entry = TILE_CATALOG.find((e) => e.type === type);
  return entry ? entry.getLazyComponent() : undefined;
}

export function getTileMeta(type: TileType): TileMeta | undefined {
  const entry = TILE_CATALOG.find((e) => e.type === type);
  if (!entry) return undefined;
  if (entry.meta) return entry.meta;
  if (entry.getMeta) return entry.getMeta();
  return undefined;
}
