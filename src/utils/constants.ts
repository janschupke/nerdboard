// Constants for the Nerdboard dashboard application

export const REFRESH_INTERVALS = {
  MARKET_DATA: 30000, // 30 seconds
  NEWS: 60000, // 1 minute
  WEATHER: 300000, // 5 minutes
  CUSTOM: 60000, // 1 minute default
} as const;

export const TILE_TYPES = {
  MARKET_DATA: 'market-data',
  NEWS: 'news',
  WEATHER: 'weather',
  CUSTOM: 'custom',
} as const;

export const DEFAULT_TILE_SIZE = {
  width: 300,
  height: 200,
} as const;

export const GRID_CONFIG = {
  columns: 12,
  rowHeight: 50,
  margin: 16,
} as const;

export const API_ENDPOINTS = {
  MARKET_DATA: '/api/market-data',
  NEWS: '/api/news',
  WEATHER: '/api/weather',
} as const;

export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Request timed out',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

export const SUCCESS_MESSAGES = {
  DATA_UPDATED: 'Data updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  TILE_ADDED: 'Tile added successfully',
  TILE_REMOVED: 'Tile removed successfully',
} as const; 
