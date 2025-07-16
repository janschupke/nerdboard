// Centralized API endpoint definitions for all tiles
// Each endpoint is represented by a type-safe object with in-app URL and queryParam types

export interface ApiEndpoint<TParams extends object> {
  url: string;
  queryParams: TParams;
  broken?: boolean;
}

// --- Cryptocurrency (CoinGecko) ---
export interface CryptoMarketsParams {
  vs_currency: string; // required, e.g. 'usd'
  ids?: string; // optional, comma-separated coin ids
  order?: string; // optional, e.g. 'market_cap_desc'
  per_page?: number; // optional
  page?: number; // optional
  sparkline?: boolean; // optional
}

export const COINGECKO_MARKETS_ENDPOINT: ApiEndpoint<CryptoMarketsParams> = {
  url: '/api/coingecko/api/v3/coins/markets',
  queryParams: {} as CryptoMarketsParams,
};

// --- Weather (OpenWeatherMap) ---
export interface WeatherParams {
  lat: number; // required
  lon: number; // required
}

export const OPENWEATHERMAP_ONECALL_ENDPOINT: ApiEndpoint<WeatherParams> = {
  url: '/api/openweathermap/data/2.5/onecall',
  queryParams: {} as WeatherParams,
};

// --- GDX ETF (Alpha Vantage) ---
export interface AlphaVantageParams {
  function: string; // e.g. 'GLOBAL_QUOTE'
  symbol: string; // e.g. 'GDX'
  apikey: string;
}
export const ALPHA_VANTAGE_GDX_ENDPOINT: ApiEndpoint<AlphaVantageParams> = {
  url: '/api/alpha-vantage/query',
  queryParams: {} as AlphaVantageParams,
};

// --- Federal Funds Rate (FRED) ---
export interface FredSeriesObservationsParams {
  series_id: string; // required, e.g. 'FEDFUNDS'
  file_type: 'json'; // required
}

export const FRED_SERIES_OBSERVATIONS_ENDPOINT: ApiEndpoint<FredSeriesObservationsParams> = {
  url: '/api/fred/fred/series/observations',
  queryParams: {} as FredSeriesObservationsParams,
};

// --- Euribor Rate (EMMI) ---
export type EuriborParams = object;
export const EMMI_EURIBOR_ENDPOINT: ApiEndpoint<EuriborParams> = {
  url: '/api/emmi/euribor-rates',
  queryParams: {} as EuriborParams,
};

// --- Uranium Price (HTML Scraping) ---
export interface UraniumHtmlParams {
  range?: string; // optional, e.g. '1Y'
}
export const URANIUM_HTML_ENDPOINT: ApiEndpoint<UraniumHtmlParams> = {
  url: '/api/uranium-html',
  queryParams: {} as UraniumHtmlParams,
};

// --- Precious Metals (Metals-API) ---
export interface MetalsApiParams {
  access_key: string;
  base?: string;
  symbols?: string;
}
export const METALS_API_ENDPOINT: ApiEndpoint<MetalsApiParams> = {
  url: '/api/metals-api/latest',
  queryParams: {} as MetalsApiParams,
};

// --- Time (WorldTimeAPI) ---
export interface TimeParams {
  city: string; // required, e.g. 'Europe/Berlin'
}
export const TIME_API_ENDPOINT: ApiEndpoint<TimeParams> = {
  url: '/api/time',
  queryParams: {} as TimeParams,
};

// --- Typhoon (CWB) ---
export interface TyphoonParams {
  Authorization: string; // required API key
  format?: 'JSON' | 'XML'; // optional
  dataid?: string; // optional
}

export const CWB_TYPHOON_ENDPOINT: ApiEndpoint<TyphoonParams> = {
  url: '/api/cwb/v1/rest/datastore/W-C0034-002',
  queryParams: {} as TyphoonParams,
};

// --- Earthquake (USGS) ---
export interface UsgsEarthquakeParams {
  [key: string]: string | number;
}
export const USGS_EARTHQUAKE_ENDPOINT: ApiEndpoint<UsgsEarthquakeParams> = {
  url: '/api/usgs/fdsnws/event/1/query',
  queryParams: {} as UsgsEarthquakeParams,
};

// --- Endpoint Parser ---
export function buildApiUrl<TParams extends object>(
  endpoint: ApiEndpoint<TParams>,
  params: TParams,
): string {
  if (endpoint.broken) {
    throw new Error('This endpoint is currently broken or not implemented.');
  }
  // For endpoints with path params (e.g. Yahoo Finance), handle manually in the hook
  const url = endpoint.url;
  const query = Object.entries(params)
    .filter((entry) => entry[1] !== undefined && entry[1] !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return query ? `${url}?${query}` : url;
}
