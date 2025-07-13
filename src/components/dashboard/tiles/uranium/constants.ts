export const URANIUM_API_CONFIG = {
  BASE_URL: 'https://api.tradingeconomics.com/commodity/uranium',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  FALLBACK_URLS: [
    'https://www.quandl.com/api/v3/datasets/ODA/PURAN_USD.json',
    'https://www.uxc.com/p/data.asp',
  ],
  DEFAULT_REFRESH_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const URANIUM_UI_CONFIG = {
  CHART_HEIGHTS: {
    small: 120,
    medium: 180,
    large: 240,
  },
  TIME_RANGES: ['1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const,
  DEFAULT_TIME_RANGE: '1Y' as const,
} as const;

export const URANIUM_CHART_CONFIG = {
  COLORS: {
    PRIMARY: 'var(--color-primary-500)',
    UP: 'var(--color-success-500)',
    DOWN: 'var(--color-error-500)',
  },
  STYLES: {
    STROKE_WIDTH: 2,
    ACTIVE_DOT_RADIUS: 4,
    FONT_SIZE: 10,
  },
} as const;

export const URANIUM_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load uranium price data',
  API_ERROR: 'API request failed',
  NETWORK_ERROR: 'Network error occurred',
  NO_DATA: 'No uranium price data available',
} as const;

export const URANIUM_MARKET_INFO = {
  SUPPLY_LABEL: 'Supply',
  DEMAND_LABEL: 'Demand',
  VOLUME_LABEL: 'Trading Volume',
  STATUS_LABEL: 'Market Status',
} as const; 
