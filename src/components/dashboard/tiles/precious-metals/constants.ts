// API Configuration
export const PRECIOUS_METALS_API_CONFIG = {
  CACHE_DURATION: 300000, // 5 minutes
  DEFAULT_REFRESH_INTERVAL: 300000, // 5 minutes
} as const;

// UI Configuration
export const PRECIOUS_METALS_UI_CONFIG = {
  CHART_HEIGHTS: {
    LARGE: 300,
    MEDIUM: 200,
    SMALL: 150,
  },
  CHART_PERIODS: ['7d', '30d', '1y'] as const,
  DEFAULT_CHART_PERIOD: '7d' as const,
  AVAILABLE_METALS: ['gold', 'silver'] as const,
  DEFAULT_METAL: 'gold' as const,
} as const;

// Chart Configuration
export const PRECIOUS_METALS_CHART_CONFIG = {
  COLORS: {
    GOLD: '#FFD700',
    SILVER: '#C0C0C0',
  },
  STYLES: {
    STROKE_WIDTH: 2,
    ACTIVE_DOT_RADIUS: 4,
    FONT_SIZE: 10,
  },
} as const;

// Mock Data Configuration
export const PRECIOUS_METALS_MOCK_CONFIG = {
  GOLD: {
    BASE_PRICE: 1950.50,
    CHANGE_24H: 12.30,
    CHANGE_PERCENTAGE_24H: 0.63,
    VOLATILITY: 50,
  },
  SILVER: {
    BASE_PRICE: 24.75,
    CHANGE_24H: -0.15,
    CHANGE_PERCENTAGE_24H: -0.60,
    VOLATILITY: 2,
  },
  TIME_CONSTANTS: {
    DAY_MS: 24 * 60 * 60 * 1000,
  },
} as const;

// Error Messages
export const PRECIOUS_METALS_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load precious metals data',
  NO_DATA_AVAILABLE: 'No data available',
} as const; 
