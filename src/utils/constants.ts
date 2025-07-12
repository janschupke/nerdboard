// Global API Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Global UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 200, // milliseconds
  TRANSITION_DURATION: 300, // milliseconds
  FOCUS_RING_OFFSET: 2,
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
  },
} as const;

// Global Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  UNKNOWN_ERROR: 'An unknown error occurred',
  VALIDATION_ERROR: 'Invalid data provided',
} as const;

// Global Time Constants
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
} as const;

// Global Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300000, // 5 minutes
  SHORT_TTL: 30000, // 30 seconds
  LONG_TTL: 1800000, // 30 minutes
} as const;
