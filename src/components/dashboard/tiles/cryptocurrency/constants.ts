// API Configuration
export const CRYPTO_API_CONFIG = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  CACHE_DURATION: 30000, // 30 seconds
  DEFAULT_LIMIT: 10,
  DEFAULT_REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

// UI Configuration
export const CRYPTO_UI_CONFIG = {
  CHART_HEIGHTS: {
    LARGE: 300,
    MEDIUM: 200,
    SMALL: 150,
  },
  CHART_PERIODS: ['7d', '30d', '1y'] as const,
  DEFAULT_CHART_PERIOD: '7d' as const,
  TOP_COINS_DISPLAY_LIMIT: 10,
} as const;

// Chart Configuration
export const CRYPTO_CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#1E40AF',
  },
  STYLES: {
    STROKE_WIDTH: 2,
    ACTIVE_DOT_RADIUS: 4,
    FONT_SIZE: 10,
  },
} as const;

// Error Messages
export const CRYPTO_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load cryptocurrency data',
  API_ERROR: 'API request failed',
  NETWORK_ERROR: 'Network error occurred',
} as const; 
