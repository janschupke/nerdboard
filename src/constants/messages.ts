export const MESSAGES = {
  loading: {
    cryptocurrency: 'Loading cryptocurrency data...',
    preciousMetals: 'Loading precious metals data...',
    general: 'Loading...',
  },
  error: {
    network: 'Network error. Please check your connection.',
    api: 'Failed to load data. Please try again.',
    unknown: 'An unexpected error occurred.',
    cryptocurrency: 'Failed to load cryptocurrency data',
    preciousMetals: 'Failed to load precious metals data',
  },
  empty: {
    cryptocurrency: 'No cryptocurrency data available',
    preciousMetals: 'No precious metals data available',
    general: 'No data available',
  },
  success: {
    dataLoaded: 'Data loaded successfully',
    settingsSaved: 'Settings saved successfully',
  },
} as const;

export type Messages = typeof MESSAGES;
