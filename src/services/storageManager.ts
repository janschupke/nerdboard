import React from 'react';
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

export interface APILogEntry {
  id: string;
  timestamp: number;
  level: APILogLevel;
  apiCall: string;
  reason: string;
  details?: Record<string, unknown>;
}

// Add TileConfig type
export interface TileConfig {
  data: Record<string, unknown> | null;
  lastDataRequest: number;
  lastDataRequestSuccessful: boolean;
}

// Add StorageMetrics type
export interface StorageMetrics {
  tileCount: number;
  // Add more metrics as needed
}

// --- Constants ---
export const STORAGE_KEYS = {
  VERSION: 'nerdboard-data-version',
  APPCONFIG: 'nerdboard-app-config',
  TILECONFIG: 'nerdboard-tile-config',
  SIDEBAR: 'nerdboard-sidebar-state',
  LOGS: 'nerdboard_api_logs',
};

export const DATA_VERSION = 1718040000000;
export const DEFAULT_APPCONFIG: AppConfig = {
  isSidebarCollapsed: false,
  theme: AppTheme.light,
};

// --- Storage Manager Implementation ---
export class StorageManager {
  private appConfig: AppConfig = DEFAULT_APPCONFIG;
  private tileConfig: Record<string, TileConfig> = {};
  private sidebarState: SidebarState | null = null;
  private logs: APILogEntry[] = [];
  private initialized = false;

  init() {
    if (this.initialized) return;
    try {
      const version = Number(localStorage.getItem(STORAGE_KEYS.VERSION));
      if (version !== DATA_VERSION) {
        localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION.toString());
      }
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

  getTileConfig(tileName: string): TileConfig | null {
    this.init();
    return this.tileConfig[tileName] ?? null;
  }
  setTileConfig(tileName: string, config: TileConfig) {
    this.tileConfig[tileName] = config;
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

  getDataVersion(): number {
    this.init();
    return DATA_VERSION;
  }

  getStorageMetrics(): StorageMetrics {
    this.init();
    return {
      tileCount: Object.keys(this.tileConfig).length,
      // Add more metrics as needed
    };
  }
}

export const storageManager = new StorageManager();

export const StorageManagerContext = React.createContext(storageManager);
export const useStorageManager = () => React.useContext(StorageManagerContext);
