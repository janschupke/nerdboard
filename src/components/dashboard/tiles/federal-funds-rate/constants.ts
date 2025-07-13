import { UI_CONFIG } from '../../../../utils/constants';

// API Configuration
export const FEDERAL_FUNDS_API_CONFIG = {
  FRED_BASE_URL: '/api/fred/fred/series/observations',
  SERIES_ID: 'FEDFUNDS',
  API_KEY: import.meta.env.VITE_FRED_API_KEY || '',
  CACHE_DURATION: 86400000, // 24 hours
  DEFAULT_REFRESH_INTERVAL: 86400000, // 24 hours
  FALLBACK_URL: 'https://fred.stlouisfed.org/series/FEDFUNDS',
} as const;

// UI Configuration
export const FEDERAL_FUNDS_UI_CONFIG = {
  CHART_HEIGHTS: UI_CONFIG.CHART_HEIGHTS,
  TIME_RANGES: ['1M', '3M', '6M', '1Y', '5Y', 'Max'] as const,
  DEFAULT_TIME_RANGE: '1Y' as const,
  RATE_DECIMAL_PLACES: 2,
} as const;

// Chart Configuration
export const FEDERAL_FUNDS_CHART_CONFIG = {
  COLORS: {
    PRIMARY: 'var(--color-primary-500)',
    SECONDARY: 'var(--color-primary-700)',
    POSITIVE: 'var(--color-success-500)',
    NEGATIVE: 'var(--color-error-500)',
  },
  STYLES: {
    STROKE_WIDTH: 2,
    ACTIVE_DOT_RADIUS: 4,
    FONT_SIZE: 10,
  },
} as const;

// Error Messages
export const FEDERAL_FUNDS_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load Federal Funds rate data',
  API_ERROR: 'FRED API request failed',
  NETWORK_ERROR: 'Network error occurred',
  SCRAPING_FAILED: 'Failed to scrape rate data',
  NO_DATA: 'No Federal Funds rate data available',
} as const;

// Time Range Configuration
export const TIME_RANGE_CONFIG = {
  '1M': { days: 30, label: '1 Month' },
  '3M': { days: 90, label: '3 Months' },
  '6M': { days: 180, label: '6 Months' },
  '1Y': { days: 365, label: '1 Year' },
  '5Y': { days: 1825, label: '5 Years' },
  'Max': { days: 3650, label: 'Max' },
} as const; 
