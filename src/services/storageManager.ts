import React from 'react';
import type { DashboardTile } from '../components/dragboard/dashboard';

// --- Types ---
export const AppTheme = {
  light: 'light',
  dark: 'dark',
} as const;
export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];

export type APILogLevel = 'warning' | 'error';

export interface AppConfig {
  isSidebarCollapsed: boolean;
  theme: AppTheme;
}

export interface SidebarState {
  activeTiles: string[];
  isCollapsed: boolean;
  lastUpdated: number;
}

// Improved typing for API log details - only string or number values
export interface APILogDetails {
  [key: string]: string | number;
}

export interface APILogEntry {
  id: string;
  timestamp: number;
  level: APILogLevel;
  apiCall: string;
  reason: string;
  details?: APILogDetails;
}

export interface TileDataType {
  // Base properties that all tile data should have
  lastUpdated?: string;
}

// Generic TileConfig with typed data for tile content
export interface TileConfig<TData extends TileDataType = TileDataType> extends TileDataType {
  data: TData | null;
  lastDataRequest: number;
  lastDataRequestSuccessful: boolean;
}

// Extended DashboardTile that includes TileConfig in the config property
export interface DashboardTileWithConfig extends Omit<DashboardTile, 'config'> {
  config: TileConfig;
}

// --- Constants ---
export const STORAGE_KEYS = {
  VERSION: 'nerdboard-data-version',
  APPCONFIG: 'nerdboard-app-config',
  TILECONFIG: 'nerdboard-tile-config',
  SIDEBAR: 'nerdboard-sidebar-state',
  LOGS: 'nerdboard_api_logs',
};

export const DEFAULT_APPCONFIG: AppConfig = {
  isSidebarCollapsed: false,
  theme: AppTheme.light,
};

// --- StorageManager Types ---
export interface TileConfigMap {
  // Dashboard tiles (board state) - now stores array of tiles with their configs
  'dashboard-tiles': DashboardTileWithConfig[];
}

type TileConfigKey = keyof TileConfigMap;

type TileConfigType<K extends TileConfigKey> = TileConfigMap[K];

// --- Storage Manager Implementation ---
export class StorageManager {
  private appConfig: AppConfig = DEFAULT_APPCONFIG;
  private tileConfig: Partial<TileConfigMap> & Record<string, unknown> = {};
  private sidebarState: SidebarState | null = null;
  private logs: APILogEntry[] = [];
  private initialized = false;

  init() {
    if (this.initialized) return;
    try {
      const appConfigRaw = localStorage.getItem(STORAGE_KEYS.APPCONFIG);
      this.appConfig = appConfigRaw ? JSON.parse(appConfigRaw) : DEFAULT_APPCONFIG;
      const tileConfigRaw = localStorage.getItem(STORAGE_KEYS.TILECONFIG);
      this.tileConfig = tileConfigRaw ? JSON.parse(tileConfigRaw) : {};
      const sidebarRaw = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      this.sidebarState = sidebarRaw ? JSON.parse(sidebarRaw) : null;
      const logsRaw = localStorage.getItem(STORAGE_KEYS.LOGS);
      this.logs = logsRaw ? JSON.parse(logsRaw) : [];
      this.initialized = true;
    } catch (error) {
      console.error('StorageManager init failed:', error);
    }
  }

  getAppConfig(): AppConfig {
    this.init();
    return this.appConfig;
  }
  setAppConfig(config: AppConfig) {
    this.appConfig = config;
    try {
      localStorage.setItem(STORAGE_KEYS.APPCONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save app config:', error);
    }
  }

  // Type-safe getter for known keys
  getTileConfig<K extends TileConfigKey>(tileName: K): TileConfigType<K> | null {
    this.init();
    const config = this.tileConfig[tileName];
    return config ? (config as TileConfigType<K>) : null;
  }

  // Type-safe setter for known keys
  setTileConfig<K extends TileConfigKey>(tileName: K, config: TileConfigType<K>) {
    this.tileConfig[tileName] = config;
    try {
      localStorage.setItem(STORAGE_KEYS.TILECONFIG, JSON.stringify(this.tileConfig));
    } catch (error) {
      console.error('Failed to save tile config:', error);
    }
  }

  // Generic getter for dynamic keys (tile instances)
  getTileInstanceConfig<TData extends TileDataType>(tileId: string): TileConfig<TData> | null {
    this.init();
    const config = this.tileConfig[tileId];
    return config ? (config as TileConfig<TData>) : null;
  }

  // Generic setter for dynamic keys (tile instances)
  setTileInstanceConfig<TData extends TileDataType>(tileId: string, config: TileConfig<TData>) {
    this.tileConfig[tileId] = config;
    try {
      localStorage.setItem(STORAGE_KEYS.TILECONFIG, JSON.stringify(this.tileConfig));
    } catch (error) {
      console.error('Failed to save tile config:', error);
    }
  }

  getSidebarState(): SidebarState | null {
    this.init();
    return this.sidebarState;
  }
  setSidebarState(state: SidebarState) {
    this.sidebarState = state;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }

  getLogs(): APILogEntry[] {
    this.init();
    return this.logs;
  }
  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>) {
    const newLog: APILogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 1000) this.logs.splice(1000);
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }
  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGS);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  clearTileConfigs() {
    this.tileConfig = {};
    try {
      localStorage.removeItem(STORAGE_KEYS.TILECONFIG);
    } catch (error) {
      console.error('Failed to clear tile configs:', error);
    }
  }
}

export const storageManager = new StorageManager();

export const StorageManagerContext = React.createContext(storageManager);
export const useStorageManager = () => React.useContext(StorageManagerContext);
