import { UI_CONFIG } from '../../../../utils/constants';

// Time Configuration
export const TIME_CONFIG = {
  UPDATE_INTERVAL: 1000, // 1 second
  BUSINESS_HOURS: {
    START: 9, // 9 AM
    END: 17, // 5 PM
  },
  CITIES: {
    HELSINKI: {
      name: 'Helsinki',
      timezone: 'Europe/Helsinki',
      abbreviation: 'EET',
      businessHours: { start: 9, end: 17 },
    },
    PRAGUE: {
      name: 'Prague',
      timezone: 'Europe/Prague',
      abbreviation: 'CET',
      businessHours: { start: 9, end: 17 },
    },
    TAIPEI: {
      name: 'Taipei',
      timezone: 'Asia/Taipei',
      abbreviation: 'CST',
      businessHours: { start: 9, end: 18 },
    },
  },
} as const;

// UI Configuration
export const TIME_UI_CONFIG = {
  CHART_HEIGHTS: UI_CONFIG.CHART_HEIGHTS,
  TIME_FORMATS: {
    TWELVE_HOUR: '12-hour',
    TWENTY_FOUR_HOUR: '24-hour',
  },
  DEFAULT_TIME_FORMAT: '24-hour' as const,
} as const;

// Error Messages
export const TIME_ERROR_MESSAGES = {
  TIMEZONE_ERROR: 'Unable to display time for this timezone',
  CALCULATION_ERROR: 'Time calculation error',
  UNSUPPORTED_TIMEZONE: 'Unsupported timezone',
} as const;

// Business Hours Status
export const BUSINESS_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  SOON: 'opening soon',
  CLOSING: 'closing soon',
} as const;
