import { UI_CONFIG } from '../../../../utils/constants';

// API Configuration
export const GDX_API_CONFIG = {
  ALPHA_VANTAGE_BASE_URL: '/api/alpha-vantage/query',
  YAHOO_FINANCE_BASE_URL: '/api/yahoo-finance/v8/finance/chart',
  IEX_CLOUD_BASE_URL: '/api/iex-cloud/stable/stock',
  CACHE_DURATION: 60000, // 1 minute
  DEFAULT_REFRESH_INTERVAL: 60000, // 1 minute during market hours
  SYMBOL: 'GDX',
  FULL_NAME: 'VanEck Vectors Gold Miners ETF',
} as const;

// UI Configuration
export const GDX_UI_CONFIG = {
  CHART_HEIGHTS: UI_CONFIG.CHART_HEIGHTS,
  CHART_PERIODS: ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const,
  DEFAULT_CHART_PERIOD: '1M' as const,
  PRICE_DECIMAL_PLACES: 2,
  VOLUME_DECIMAL_PLACES: 0,
  MARKET_HOURS: {
    OPEN: '09:30',
    CLOSE: '16:00',
    TIMEZONE: 'America/New_York',
  },
} as const;

// Chart Configuration
export const GDX_CHART_CONFIG = {
  COLORS: {
    PRIMARY: 'var(--color-primary-500)',
    SECONDARY: 'var(--color-primary-700)',
    POSITIVE: 'var(--color-success-500)',
    NEGATIVE: 'var(--color-error-500)',
    VOLUME: 'var(--color-accent-300)',
  },
  STYLES: {
    STROKE_WIDTH: 2,
    ACTIVE_DOT_RADIUS: 4,
    FONT_SIZE: 10,
  },
} as const;

// Error Messages
export const GDX_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load GDX ETF data',
  API_ERROR: 'API request failed',
  NETWORK_ERROR: 'Network error occurred',
  RATE_LIMIT: 'API rate limit exceeded',
  NO_DATA: 'No GDX ETF data available',
} as const;

// Market Status Messages
export const GDX_MARKET_MESSAGES = {
  MARKET_OPEN: 'Market Open',
  MARKET_CLOSED: 'Market Closed',
  PRE_MARKET: 'Pre-Market',
  AFTER_HOURS: 'After Hours',
} as const; 
