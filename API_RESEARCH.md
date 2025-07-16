# API Research Document

## Overview

This document provides a comprehensive analysis of API endpoints for the NerdBoard application, including existing implementations, their current status, alternatives, and new endpoints for earthquake and typhoon data.

## Existing Endpoints Analysis

### 1. Cryptocurrency Data (CoinGecko)

**Current Implementation:**

- **API**: CoinGecko API
- **URL**: `https://api.coingecko.com/api/v3/coins/markets`
- **Status**: ✅ Working
- **Free Tier**: 50 calls/minute, 10,000 calls/month
- **Documentation**: https://docs.coingecko.com/

**Query Parameters:**

```typescript
interface CryptoMarketsParams {
  vs_currency: string; // required, e.g. 'usd'
  ids?: string; // optional, comma-separated coin ids
  order?: string; // optional, e.g. 'market_cap_desc'
  per_page?: number; // optional, default 100
  page?: number; // optional, default 1
  sparkline?: boolean; // optional, default false
}
```

**Response Type:**

```typescript
interface CryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
}
```

**Alternative APIs:**

- **Binance API**: Free, no rate limits for public data
- **CoinMarketCap API**: Requires API key, limited free tier
- **CryptoCompare API**: Free tier available

### 2. Weather Data (OpenWeatherMap)

**Current Implementation:**

- **API**: OpenWeatherMap OneCall API
- **URL**: `https://api.openweathermap.org/data/2.5/onecall`
- **Status**: ⚠️ Requires API key
- **Free Tier**: 1,000 calls/day
- **Documentation**: https://openweathermap.org/api

**Query Parameters:**

```typescript
interface WeatherParams {
  lat: number; // required
  lon: number; // required
  appid: string; // required API key
  units?: 'metric' | 'imperial' | 'kelvin'; // optional
  exclude?: string; // optional, comma-separated parts to exclude
}
```

**Response Type:**

```typescript
interface WeatherApiResponse {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    pressure: number;
    visibility: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    dt: number;
  };
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  timezone: string;
}
```

**Alternative APIs:**

- **WeatherAPI.com**: Free tier with 1,000,000 calls/month
- **AccuWeather**: Limited free tier
- **Tomorrow.io**: Free tier available
- **Visual Crossing Weather**: Free tier with 1,000 calls/day

### 3. Time/DateTime Data

**Current Implementation:**

- **API**: WorldTimeAPI
- **URL**: `https://worldtimeapi.org/api/timezone/{city}`
- **Status**: ✅ Working
- **Free Tier**: No limits
- **Documentation**: http://worldtimeapi.org/

**Query Parameters:**

```typescript
interface TimeParams {
  city: string; // required, e.g. 'Europe/Berlin'
}
```

**Response Type:**

```typescript
interface TimeApiResponse {
  datetime: string;
  utc_datetime: string;
  utc_offset: string;
  timezone: string;
  day_of_week: number;
  day_of_year: number;
  week_number: number;
}
```

**Alternative APIs:**

- **TimeZoneDB**: Free tier with 1,000 requests/month
- **Abstract API Timezone**: Free tier available

### 4. US Federal Funds Rate (FRED)

**Current Implementation:**

- **API**: Federal Reserve Economic Data (FRED)
- **URL**: `https://api.stlouisfed.org/fred/series/observations`
- **Status**: ⚠️ Requires API key
- **Free Tier**: 1,000 requests per day
- **Documentation**: https://fred.stlouisfed.org/docs/api/

**Query Parameters:**

```typescript
interface FredSeriesObservationsParams {
  series_id: string; // required, e.g. 'FEDFUNDS'
  file_type: 'json'; // required
  api_key: string; // required
  observation_start?: string; // optional
  observation_end?: string; // optional
  frequency?: string; // optional
  aggregation_method?: string; // optional
}
```

**Response Type:**

```typescript
interface FredApiResponse {
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}
```

**Alternative APIs:**

- **Federal Reserve Bank APIs**: Various regional banks provide data
- **Trading Economics**: Requires subscription
- **Yahoo Finance**: Free but limited historical data

### 5. Euribor Rates

**Current Implementation:**

- **API**: EMMI (European Money Markets Institute)
- **URL**: `https://www.emmi-benchmarks.eu/euribor-rates`
- **Status**: ❌ Broken - HTML scraping required
- **Documentation**: https://www.emmi-benchmarks.eu/

**Alternative APIs:**

- **ECB (European Central Bank)**: Free API available
- **Trading Economics**: Requires subscription
- **Bloomberg API**: Requires subscription

**ECB API Details:**

- **URL**: `https://api.data.ecb.europa.eu/service/data/EXR/D.EUR.EURIBOR6MD.EA`
- **Status**: ✅ Free, no API key required
- **Format**: XML (default), JSON available with `?format=jsondata`
- **Documentation**: https://data.ecb.europa.eu/help/api

**Scraping Alternative:**

```typescript
interface EuriborScrapingData {
  rates: Array<{
    period: string; // 1W, 1M, 3M, 6M, 12M
    rate: number;
    date: string;
  }>;
}
```

### 6. GDX ETF Data

**Current Implementation:**

- **API**: Yahoo Finance
- **URL**: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- **Status**: ❌ Broken - proxy disabled
- **Documentation**: No official API documentation

**Alternative APIs:**

- **Alpha Vantage**: Free tier with 500 requests/day
- **IEX Cloud**: Free tier with 1,000 requests/month
- **Polygon.io**: Free tier available
- **Finnhub**: Free tier with 60 requests/minute

### 7. Uranium Price Data

**Current Implementation:**

- **API**: Trading Economics
- **URL**: `https://api.tradingeconomics.com/commodity/uranium`
- **Status**: ⚠️ Requires API key
- **Documentation**: https://tradingeconomics.com/api/

**Query Parameters:**

```typescript
interface UraniumParams {
  range?: string; // optional, e.g. '1Y'
  c?: string; // required API key
}
```

**Alternative APIs:**

- **Quandl**: Free tier available
- **UXC**: Free data available
- **Kitco**: Scraping required
- **UxC**: Professional data provider

### 8. Precious Metals Data

**Current Implementation:**

- **API**: Not implemented
- **Status**: ❌ Missing implementation

**Recommended APIs:**

- **Kitco**: Free data available (scraping required)
- **GoldAPI**: Free tier with 100 requests/month
- **Metals-API**: Free tier available
- **Alpha Vantage**: Commodity data available

## New Endpoints Research

### 1. Earthquake Data

**Recommended APIs:**

#### A. USGS Earthquake API (Recommended)

- **URL**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- **Status**: ✅ Free, no API key required
- **Documentation**: https://earthquake.usgs.gov/fdsnws/event/1/

**Query Parameters:**

```typescript
interface EarthquakeParams {
  starttime?: string; // optional, ISO 8601 format
  endtime?: string; // optional, ISO 8601 format
  minmagnitude?: number; // optional
  maxmagnitude?: number; // optional
  orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc'; // optional
  limit?: number; // optional, default 20,000
}
```

**Response Type:**

```typescript
interface EarthquakeApiResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: Array<{
    type: 'Feature';
    properties: {
      mag: number;
      place: string;
      time: number;
      updated: number;
      tz: number;
      url: string;
      detail: string;
      felt: number;
      cdi: number;
      mmi: number;
      alert: string;
      status: string;
      tsunami: number;
      sig: number;
      net: string;
      code: string;
      ids: string;
      sources: string;
      types: string;
      nst: number;
      dmin: number;
      rms: number;
      gap: number;
      magType: string;
      type: string;
      title: string;
    };
    geometry: {
      type: 'Point';
      coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
    id: string;
  }>;
}
```

#### B. EMSC (European-Mediterranean Seismological Centre)

- **URL**: `https://www.seismicportal.eu/fdsnws/event/1/query`
- **Status**: ✅ Free, no API key required
- **Documentation**: https://www.seismicportal.eu/

**Query Parameters:**

```typescript
interface EMSCParams {
  starttime?: string; // optional, ISO 8601 format
  endtime?: string; // optional, ISO 8601 format
  minmagnitude?: number; // optional
  maxmagnitude?: number; // optional
  format?: 'json' | 'xml' | 'text'; // optional, default json
  limit?: number; // optional
}
```

**Response Type:**

```typescript
interface EMSCApiResponse {
  type: 'FeatureCollection';
  metadata: {
    count: number;
  };
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
    id: string;
    properties: {
      source_id: string;
      source_catalog: string;
      lastupdate: string;
      time: string;
      flynn_region: string;
      lat: number;
      lon: number;
      depth: number;
      magnitude: number;
      magnitude_type: string;
      magnitude_uncertainty: number;
    };
  }>;
}
```

#### C. GEOFON (GFZ German Research Centre for Geosciences)

- **URL**: `https://geofon.gfz-potsdam.de/fdsnws/event/1/query`
- **Status**: ✅ Free, no API key required

### 2. Taiwan Typhoon Data

**Recommended APIs:**

#### A. Central Weather Bureau (CWB) - Taiwan

- **URL**: `https://opendata.cwb.gov.tw/api/v1/rest/datastore/W-C0034-002`
- **Status**: ✅ Free, requires API key
- **Documentation**: https://opendata.cwb.gov.tw/
- **API Key**: Free registration required

**Query Parameters:**

```typescript
interface TyphoonParams {
  Authorization: string; // required API key
  format?: 'JSON' | 'XML'; // optional
  dataid?: string; // optional
}
```

**Response Type:**

```typescript
interface TyphoonApiResponse {
  success: string;
  result: {
    resource_id: string;
    fields: Array<{
      id: string;
      type: string;
    }>;
  };
  records: {
    datasetDescription: string;
    location: Array<{
      locationName: string;
      geocode: Array<{
        value: string;
        geocodeName: string;
      }>;
      weatherElement: Array<{
        elementName: string;
        description: string;
        time: Array<{
          startTime: string;
          endTime: string;
          parameter: Array<{
            parameterName: string;
            parameterValue: string;
            parameterUnit: string;
          }>;
        }>;
      }>;
    }>;
  };
}
```

#### B. JTWC (Joint Typhoon Warning Center)

- **URL**: `https://www.metoc.navy.mil/jtwc/jtwc.html`
- **Status**: ⚠️ Requires scraping
- **Documentation**: https://www.metoc.navy.mil/jtwc/

**Scraping Alternative:**

```typescript
interface TyphoonScrapingData {
  typhoons: Array<{
    name: string;
    category: string;
    position: {
      lat: number;
      lon: number;
    };
    wind_speed: number;
    pressure: number;
    forecast: Array<{
      time: string;
      lat: number;
      lon: number;
      wind_speed: number;
    }>;
  }>;
}
```

#### C. Hong Kong Observatory

- **URL**: `https://www.hko.gov.hk/en/wxinfo/currwx/tc_posc.htm`
- **Status**: ⚠️ Requires scraping
- **Documentation**: https://www.hko.gov.hk/

## Implementation Recommendations

### 1. Fix Existing Broken Endpoints

#### Euribor Rates

```typescript
// Implement ECB API as primary source
const ECB_EURIBOR_ENDPOINT: ApiEndpoint<EuriborParams> = {
  url: '/api/ecb/data/EXR/D.EUR.EURIBOR6MD.EA',
  queryParams: {} as EuriborParams,
};
```

#### GDX ETF

```typescript
// Use Alpha Vantage as primary source
const ALPHA_VANTAGE_QUOTE_ENDPOINT: ApiEndpoint<AlphaVantageParams> = {
  url: '/api/alpha-vantage/query',
  queryParams: {
    function: 'GLOBAL_QUOTE',
    symbol: 'GDX',
    apikey: process.env.ALPHA_VANTAGE_API_KEY,
  } as AlphaVantageParams,
};
```

### 2. Add New Endpoints

#### Earthquake Data

```typescript
const USGS_EARTHQUAKE_ENDPOINT: ApiEndpoint<EarthquakeParams> = {
  url: '/api/usgs/earthquakes/feed/v1.0/summary/all_day.geojson',
  queryParams: {} as EarthquakeParams,
};
```

#### Typhoon Data

```typescript
const CWB_TYPHOON_ENDPOINT: ApiEndpoint<TyphoonParams> = {
  url: '/api/cwb/v1/rest/datastore/W-C0034-002',
  queryParams: {
    Authorization: process.env.CWB_API_KEY,
  } as TyphoonParams,
};
```

### 3. Scraping Implementations

For endpoints that require scraping:

```typescript
// Example scraping service
interface ScrapingService {
  url: string;
  selectors: {
    [key: string]: string;
  };
  parser: (html: string) => any;
}

const EMMI_SCRAPING: ScrapingService = {
  url: 'https://www.emmi-benchmarks.eu/euribor-rates',
  selectors: {
    rates: '.euribor-rates-table tbody tr',
    period: 'td:nth-child(1)',
    rate: 'td:nth-child(2)',
  },
  parser: (html: string) => {
    // Parse HTML and extract Euribor rates
  },
};
```

## Rate Limiting and Caching Strategy

### Recommended Caching Strategy

- **Cryptocurrency**: Cache for 1 minute
- **Weather**: Cache for 10 minutes
- **Economic Data**: Cache for 1 hour
- **Earthquake**: Cache for 5 minutes
- **Typhoon**: Cache for 15 minutes

### Rate Limit Management

- Implement exponential backoff for failed requests
- Use multiple API sources as fallbacks
- Implement request queuing for high-frequency endpoints

## Environment Variables Required

```bash
# Required API Keys
OPENWEATHERMAP_API_KEY=your_key_here
FRED_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
CWB_API_KEY=your_key_here

# Optional API Keys (for fallbacks)
WEATHERAPI_KEY=your_key_here
TRADINGECONOMICS_API_KEY=your_key_here
```

## Testing Strategy

### API Testing

- Mock all external API calls in tests
- Test rate limiting and error handling
- Validate response type safety
- Test fallback mechanisms

### Scraping Testing

- Mock HTML responses
- Test parsing logic
- Validate data extraction accuracy
- Test error handling for malformed HTML

## Conclusion

The research shows that most required data can be obtained through free public APIs. For endpoints requiring API keys, free tiers are generally sufficient for development and moderate usage. Scraping should be used as a last resort and only for data that cannot be obtained through official APIs.

The recommended implementation order:

1. Fix broken Euribor endpoint using ECB API
2. Fix GDX ETF using Alpha Vantage
3. Implement earthquake data using USGS API
4. Implement typhoon data using CWB API
5. Add scraping fallbacks where necessary

## Testing Results

### Successfully Tested APIs

#### 1. CoinGecko API

- **Status**: ✅ Working
- **Response**: Returns valid JSON with cryptocurrency data
- **Rate Limits**: Confirmed working within limits

#### 2. USGS Earthquake API

- **Status**: ✅ Working
- **Response**: Returns valid GeoJSON with 320 earthquakes in the last 24 hours
- **Data Quality**: High quality with detailed metadata
- **No API Key Required**: Confirmed

#### 3. EMSC Earthquake API

- **Status**: ✅ Working
- **Response**: Returns valid JSON with earthquake data
- **Format**: Requires `format=json` parameter (not `geojson`)
- **No API Key Required**: Confirmed

#### 4. ECB API

- **Status**: ⚠️ Partially Working
- **Response**: Returns XML by default, JSON available with `?format=jsondata`
- **No API Key Required**: Confirmed
- **Note**: Requires proper XML/JSON parsing

### Failed/Requires API Key

#### 1. OpenWeatherMap

- **Status**: ❌ Requires API Key
- **Error**: "Invalid API key"
- **Solution**: Need valid API key for testing

#### 2. FRED API

- **Status**: ❌ Requires API Key
- **Error**: "Bad Request. The value for variable api_key is not a 32 character alpha-numeric lower-case string"
- **Solution**: Need valid API key for testing

#### 3. WeatherAPI.com

- **Status**: ❌ Requires API Key
- **Error**: "API key is invalid"
- **Solution**: Need valid API key for testing

### Recommendations Based on Testing

1. **Earthquake Data**: USGS API is the most reliable and comprehensive option
2. **Euribor Rates**: ECB API is available but requires XML/JSON parsing
3. **Weather Data**: All tested weather APIs require API keys
4. **Cryptocurrency**: CoinGecko API is working well and has good rate limits

### Next Steps for Implementation

1. **Obtain API Keys**: Register for free API keys for weather services
2. **Implement ECB Parser**: Create XML/JSON parser for ECB Euribor data
3. **Test Alternative Weather APIs**: Try WeatherAPI.com with valid API key
4. **Implement USGS Earthquake**: Start with USGS API for earthquake data
5. **Add Error Handling**: Implement proper error handling for API failures

---

## 1A. Scraping & API Framework: Final Architecture Proposal

- **dataFetcher** exposes two entry points:
  - `fetchAndMap` for API endpoints (expects a fetch function returning API data, applies data mapping, saves to storage).
  - `fetchAndParse` for scraped endpoints (expects a fetch function returning raw HTML, applies a parsing function from `dataParser`, then mapping, then saves to storage).
- **Tile hooks** are responsible for:
  - Calling `fetchAndMap` for API endpoints.
  - Calling `fetchAndParse` for scraped endpoints.
  - They know which method to use based on the selected retrieval method for the tile.
- **dataParser** (new file in `src/services/`):
  - Similar to `dataMapper`, but for parsing raw HTML (or other non-API formats) into usable objects.
  - Each tile that uses scraping registers its parser in `dataParser`.
  - Parsers are pure functions, unit-tested with sample HTML.
- **dataMapper**: Remains responsible for mapping parsed data (from API or parser) to `TileData`.
- **storageManager**: Unchanged; handles persistence.

### Example Usage

**API tile hook:**

```typescript
const result = await DataFetcher.fetchAndMap(
  () => fetch(apiUrl).then((res) => res.json()),
  tileId,
  TileType.MY_API_TILE,
  { apiCall: 'My API', forceRefresh },
);
```

**Scraped tile hook:**

```typescript
import { DataFetcher } from '../../../services/dataFetcher';
import { dataParser } from '../../../services/dataParser';

const result = await DataFetcher.fetchAndParse(
  () => fetch(scrapeUrl).then((res) => res.text()),
  tileId,
  TileType.MY_SCRAPED_TILE,
  dataParser.get('MY_SCRAPED_TILE'),
  { apiCall: 'My Scraped Endpoint', forceRefresh },
);
```

---

## 1B. dataParser: Structure and Usage

- Create `src/services/dataParser.ts`:
  - Export a registry and interface similar to `dataMapper`.
  - Each parser is registered by tile type.
  - Example:

```typescript
export interface DataParser<TRaw, TParsed> {
  parse(raw: TRaw): TParsed;
  validate(raw: unknown): raw is TRaw;
}

export class DataParserRegistry {
  private static parsers = new Map<string, DataParser<any, any>>();
  static register<TileType extends string, TRaw, TParsed>(
    tileType: TileType,
    parser: DataParser<TRaw, TParsed>,
  ) {
    this.parsers.set(tileType, parser);
  }
  static get<TileType extends string, TRaw, TParsed>(
    tileType: TileType,
  ): DataParser<TRaw, TParsed> | undefined {
    return this.parsers.get(tileType) as DataParser<TRaw, TParsed> | undefined;
  }
}
```

- Each tile with scraping registers its parser in `dataParser.ts`.

---

## 1C. Per-Tile Retrieval Method Selection

- For each tile, the research must specify:
  - The selected retrieval method: `API` or `SCRAPE` (never both).
  - The rationale (e.g., "No viable API found, so scraping is used").
  - The function to use (API fetch or parser).
  - If `SCRAPE`, provide the parser function signature and expected output.

---

## 1D. Wording and Documentation Clarification

- Remove references to "fallback" except when discussing alternatives in the research phase.
- Use "retrieval method" (API or SCRAPE) as the terminology for the selected approach.
- Each tile implements only one retrieval method, determined by research.

---

## 1E. Implementation Plan (Actionable)

- [ ] Implement `fetchAndMap` and `fetchAndParse` in `dataFetcher`.
- [ ] Create and document `dataParser` in `src/services/`.
- [ ] Update tile hooks to call the correct fetcher method based on retrieval method.
- [ ] For each tile, document the selected retrieval method and rationale.
- [ ] Ensure all types and interfaces are up to date and used consistently.
- [ ] Add or update unit tests for all parsers and fetchers.
- [ ] Keep this document up to date as endpoints or requirements change.

---

## 1F. Example: Scraped Tile Integration

**Parser registration:**

```typescript
// src/services/dataParser.ts
import { DataParserRegistry } from './dataParser';
import { myScraper } from '../components/tile-implementations/my-tile/scraper';

DataParserRegistry.register('MY_SCRAPED_TILE', myScraper);
```

**Tile hook:**

```typescript
import { DataFetcher } from '../../../services/dataFetcher';
import { DataParserRegistry } from '../../../services/dataParser';

const parser = DataParserRegistry.get('MY_SCRAPED_TILE');
const result = await DataFetcher.fetchAndParse(
  () => fetch(scrapeUrl).then((res) => res.text()),
  tileId,
  TileType.MY_SCRAPED_TILE,
  parser,
  { apiCall: 'My Scraped Endpoint', forceRefresh },
);
```

---

## 1G. Summary

- The architecture now clearly separates API and scraping flows.
- Each tile uses only one retrieval method, as determined by research.
- Parsing logic for scraped data is centralized in `dataParser` and registered per tile.
- Tile hooks are responsible for calling the correct fetcher method.
- All other detail, research, and actionable steps remain as previously documented.
