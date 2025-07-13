import { UI_CONFIG } from '../../../../utils/constants';
import type { EuriborRateConfig, EuriborRateErrorMessages } from './types';

// API Configuration
export const EURIBOR_RATE_CONFIG: EuriborRateConfig = {
  EMMI_API_BASE: 'https://www.emmi-benchmarks.eu/api',
  ECB_API_BASE: 'https://api.data.ecb.europa.eu/service/data/EXR',
  CACHE_DURATION: 86400000, // 24 hours
  DEFAULT_REFRESH_INTERVAL: 86400000, // 24 hours
  DEFAULT_TIME_RANGE: '1Y',
} as const;

// UI Configuration
export const EURIBOR_RATE_UI_CONFIG = {
  CHART_HEIGHTS: UI_CONFIG.CHART_HEIGHTS,
  TIME_RANGES: ['1M', '3M', '6M', '1Y', '5Y', 'Max'] as const,
  DEFAULT_TIME_RANGE: '1Y' as const,
  RATE_DECIMAL_PLACES: 2,
} as const;

// Chart Configuration
export const EURIBOR_RATE_CHART_CONFIG = {
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
export const EURIBOR_RATE_ERROR_MESSAGES: EuriborRateErrorMessages = {
  FETCH_FAILED: 'Failed to load Euribor rate data',
  API_ERROR: 'Euribor API request failed',
  NETWORK_ERROR: 'Network error occurred',
  SCRAPING_FAILED: 'Failed to scrape rate data',
  NO_DATA: 'No Euribor rate data available',
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
