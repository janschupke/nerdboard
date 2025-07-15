export const TileType = {
  CRYPTOCURRENCY: 'cryptocurrency',
  PRECIOUS_METALS: 'precious-metals',
  FEDERAL_FUNDS_RATE: 'federal_funds_rate',
  EURIBOR_RATE: 'euribor_rate',
  WEATHER_HELSINKI: 'weather_helsinki',
  WEATHER_PRAGUE: 'weather_prague',
  WEATHER_TAIPEI: 'weather_taipei',
  GDX_ETF: 'gdx_etf',
  TIME_HELSINKI: 'time_helsinki',
  TIME_PRAGUE: 'time_prague',
  TIME_TAIPEI: 'time_taipei',
  URANIUM: 'uranium',
} as const;

export const TileSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];
export type TileSize = (typeof TileSize)[keyof typeof TileSize];

// Type aliases for backward compatibility
export type TileTypeValue = string;
export type TileSizeValue = string;
