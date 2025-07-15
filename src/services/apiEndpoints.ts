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

// --- GDX ETF (Yahoo Finance) ---
export interface YahooFinanceChartParams {
  symbol: string; // required, path param
}

export const YAHOO_FINANCE_CHART_ENDPOINT: ApiEndpoint<YahooFinanceChartParams> = {
  url: '/api/yahoo-finance/v8/finance/chart',
  queryParams: {} as YahooFinanceChartParams,
  broken: true, // proxy is disabled
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
  broken: true, // HTML-scraped, not a public JSON API
};

// --- Uranium Price (TradingEconomics) ---
export interface UraniumParams {
  range?: string; // optional, e.g. '1Y'
}
export const TRADINGECONOMICS_URANIUM_ENDPOINT: ApiEndpoint<UraniumParams> = {
  url: '/api/tradingeconomics/commodity/uranium',
  queryParams: {} as UraniumParams,
};

// --- Precious Metals ---
export type PreciousMetalsParams = object;
export const PRECIOUS_METALS_ENDPOINT: ApiEndpoint<PreciousMetalsParams> = {
  url: '/api/precious-metals',
  queryParams: {} as PreciousMetalsParams,
};

// --- Time (WorldTimeAPI) ---
export interface TimeParams {
  city: string; // required, e.g. 'Europe/Berlin'
}
export const TIME_API_ENDPOINT: ApiEndpoint<TimeParams> = {
  url: '/api/time',
  queryParams: {} as TimeParams,
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
