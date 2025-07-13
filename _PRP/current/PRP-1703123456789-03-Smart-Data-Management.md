# PRP-1703123456789-03-Smart-Data-Management

## Feature: Enhanced Data Management with Local Storage and Smart Refresh - Phase 3

### Overview

This PRP implements smart data management features to optimize local storage usage, implement intelligent data age checking, add background refresh for stale data, and ensure the dashboard works reliably even when APIs are unavailable.

### User Value

Users will experience a dashboard that works offline with cached data, intelligently manages storage to prevent browser limits, and provides seamless operation even when external services are down.

### Functional Requirements

- [ ] Implement intelligent data age checking on page load
- [ ] Add background refresh for stale data without blocking UI
- [ ] Optimize local storage usage to prevent browser storage limits
- [ ] Implement graceful degradation when APIs are unavailable
- [ ] Add storage monitoring and cleanup mechanisms
- [ ] Ensure dashboard works offline with cached data
- [ ] Implement smart retry logic for failed API calls

### Non-Functional Requirements

- [ ] Dashboard loads within 2 seconds on subsequent visits
- [ ] Local storage usage stays under 80% of browser limits
- [ ] Background refreshes don't block user interactions
- [ ] Graceful handling of all API failure scenarios
- [ ] Maintain existing performance standards

### Technical Implementation

#### 1. Enhanced Local Storage Management

Create an advanced local storage manager with intelligent cleanup and monitoring:

```typescript
// src/utils/enhancedLocalStorage.ts
import { getCachedData, setCachedData, clearExpiredData, getStorageUsage } from './localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from './constants';

export interface StorageMetrics {
  used: number;
  available: number;
  percentage: number;
  tileCount: number;
  oldestData: Date | null;
  newestData: Date | null;
}

export interface SmartStorageConfig {
  maxStoragePercentage: number; // 80% of available storage
  maxTileDataAge: number; // 24 hours
  cleanupThreshold: number; // 70% triggers cleanup
  priorityTiles: string[]; // Tiles to preserve during cleanup
}

export const SMART_STORAGE_CONFIG: SmartStorageConfig = {
  maxStoragePercentage: 80,
  maxTileDataAge: 24 * 60 * 60 * 1000, // 24 hours
  cleanupThreshold: 70,
  priorityTiles: ['cryptocurrency', 'precious-metals', 'federal-funds-rate'],
};

export class SmartStorageManager {
  private static instance: SmartStorageManager;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): SmartStorageManager {
    if (!SmartStorageManager.instance) {
      SmartStorageManager.instance = new SmartStorageManager();
    }
    return SmartStorageManager.instance;
  }

  async getData<T>(key: string, forceRefresh = false): Promise<T | null> {
    try {
      // Check if we need to force refresh based on data age
      if (!forceRefresh) {
        const cached = getCachedData<T>(key);
        if (cached) {
          // Check if data is stale and needs background refresh
          this.scheduleBackgroundRefresh(key);
          return cached;
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  async setData<T>(key: string, data: T): Promise<void> {
    try {
      // Check storage usage before saving
      const metrics = this.getStorageMetrics();

      if (metrics.percentage > SMART_STORAGE_CONFIG.maxStoragePercentage) {
        await this.performEmergencyCleanup();
      } else if (metrics.percentage > SMART_STORAGE_CONFIG.cleanupThreshold) {
        await this.performPreventiveCleanup();
      }

      setCachedData(key, data);

      // Update storage metrics
      this.updateStorageMetrics();
    } catch (error) {
      console.warn('Failed to set cached data:', error);
    }
  }

  private scheduleBackgroundRefresh(key: string): void {
    // Schedule background refresh for stale data
    setTimeout(async () => {
      try {
        const cached = getCachedData(key);
        if (cached) {
          // Trigger background refresh without blocking UI
          this.performBackgroundRefresh(key);
        }
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, 1000); // Small delay to avoid blocking initial load
  }

  private async performBackgroundRefresh(key: string): Promise<void> {
    // This will be implemented by individual tile services
    const event = new CustomEvent('background-refresh', { detail: { key } });
    window.dispatchEvent(event);
  }

  private async performEmergencyCleanup(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

      // Sort by age and priority
      const sortedKeys = tileKeys.sort((a, b) => {
        const aData = getCachedData(a);
        const bData = getCachedData(b);

        if (!aData || !bData) return 0;

        // Priority tiles get higher score
        const aPriority = SMART_STORAGE_CONFIG.priorityTiles.some((tile) => a.includes(tile))
          ? 1
          : 0;
        const bPriority = SMART_STORAGE_CONFIG.priorityTiles.some((tile) => b.includes(tile))
          ? 1
          : 0;

        if (aPriority !== bPriority) return bPriority - aPriority;

        // Then sort by age (oldest first)
        return 0; // Placeholder for actual age comparison
      });

      // Remove oldest non-priority tiles first
      const keysToRemove = sortedKeys.slice(0, Math.floor(sortedKeys.length * 0.3));

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log(`Emergency cleanup: removed ${keysToRemove.length} items`);
    } catch (error) {
      console.warn('Emergency cleanup failed:', error);
    }
  }

  private async performPreventiveCleanup(): Promise<void> {
    try {
      clearExpiredData();

      const metrics = this.getStorageMetrics();
      if (metrics.percentage > SMART_STORAGE_CONFIG.cleanupThreshold) {
        // Remove oldest 10% of data
        const keys = Object.keys(localStorage);
        const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

        const keysToRemove = tileKeys.slice(0, Math.floor(tileKeys.length * 0.1));
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        console.log(`Preventive cleanup: removed ${keysToRemove.length} items`);
      }
    } catch (error) {
      console.warn('Preventive cleanup failed:', error);
    }
  }

  getStorageMetrics(): StorageMetrics {
    const usage = getStorageUsage();
    const keys = Object.keys(localStorage);
    const tileKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.TILE_DATA_PREFIX));

    let oldestData: Date | null = null;
    let newestData: Date | null = null;

    tileKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const timestamp = new Date(parsed.timestamp);

          if (!oldestData || timestamp < oldestData) {
            oldestData = timestamp;
          }
          if (!newestData || timestamp > newestData) {
            newestData = timestamp;
          }
        }
      } catch (error) {
        console.warn('Failed to parse storage item:', error);
      }
    });

    return {
      used: usage.used,
      available: usage.available,
      percentage: (usage.used / (usage.used + usage.available)) * 100,
      tileCount: tileKeys.length,
      oldestData,
      newestData,
    };
  }

  private updateStorageMetrics(): void {
    // Update metrics for monitoring
    const metrics = this.getStorageMetrics();

    if (metrics.percentage > SMART_STORAGE_CONFIG.maxStoragePercentage) {
      console.warn('Storage usage exceeded limit:', metrics.percentage.toFixed(2) + '%');
    }
  }

  startMonitoring(): void {
    // Set up periodic cleanup
    this.cleanupInterval = setInterval(
      () => {
        this.performPreventiveCleanup();
      },
      30 * 60 * 1000,
    ); // Every 30 minutes
  }

  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const smartStorage = SmartStorageManager.getInstance();
```

#### 2. Enhanced Data Fetching with Smart Retry Logic

Create a smart data fetching service with intelligent retry and fallback mechanisms:

```typescript
// src/utils/smartDataFetcher.ts
import { smartStorage } from './enhancedLocalStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from './constants';

export interface FetchOptions {
  forceRefresh?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackToCache?: boolean;
}

export interface FetchResult<T> {
  data: T | null;
  isCached: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retryCount: number;
}

export class SmartDataFetcher {
  private static retryDelays = [1000, 2000, 5000, 10000]; // Exponential backoff

  static async fetchWithRetry<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    const {
      forceRefresh = false,
      retryCount = 0,
      retryDelay = 0,
      timeout = 10000,
      fallbackToCache = true,
    } = options;

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = await smartStorage.getData<T>(storageKey);
        if (cached) {
          return {
            data: cached,
            isCached: true,
            error: null,
            lastUpdated: new Date(),
            retryCount: 0,
          };
        }
      }

      // Fetch fresh data with timeout
      const data = await this.fetchWithTimeout(fetchFunction, timeout);

      // Cache the fresh data
      await smartStorage.setData(storageKey, data);

      return {
        data,
        isCached: false,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Try to get cached data as fallback
      if (fallbackToCache) {
        const cached = await smartStorage.getData<T>(storageKey);
        if (cached) {
          return {
            data: cached,
            isCached: true,
            error: `Using cached data due to: ${errorMessage}`,
            lastUpdated: new Date(),
            retryCount: retryCount,
          };
        }
      }

      // Retry logic
      if (retryCount < this.retryDelays.length) {
        const delay = this.retryDelays[retryCount];

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.fetchWithRetry(fetchFunction, storageKey, {
          ...options,
          retryCount: retryCount + 1,
          retryDelay: delay,
        });
      }

      return {
        data: null,
        isCached: false,
        error: errorMessage,
        lastUpdated: null,
        retryCount: retryCount,
      };
    }
  }

  private static async fetchWithTimeout<T>(
    fetchFunction: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);

      fetchFunction()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  static async fetchWithBackgroundRefresh<T>(
    fetchFunction: () => Promise<T>,
    storageKey: string,
    options: FetchOptions = {},
  ): Promise<FetchResult<T>> {
    // First, try to get cached data immediately
    const cached = await smartStorage.getData<T>(storageKey);

    if (cached) {
      // Schedule background refresh
      setTimeout(async () => {
        try {
          await this.fetchWithRetry(fetchFunction, storageKey, {
            ...options,
            forceRefresh: true,
            fallbackToCache: false, // Don't fallback during background refresh
          });
        } catch (error) {
          console.warn('Background refresh failed:', error);
        }
      }, 1000);

      return {
        data: cached,
        isCached: true,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
      };
    }

    // No cached data, fetch immediately
    return this.fetchWithRetry(fetchFunction, storageKey, options);
  }
}
```

#### 3. Enhanced Tile Hooks with Smart Data Management

Update all tile hooks to use the smart data fetcher:

```typescript
// Example: src/components/dashboard/tiles/cryptocurrency/hooks/useCryptocurrencyData.ts (enhanced)
import { useState, useEffect, useCallback } from 'react';
import { SmartDataFetcher } from '../../../../utils/smartDataFetcher';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../utils/constants';
import { CryptocurrencyData } from '../types';
import { fetchCryptocurrencyData } from '../services/coinGeckoApi';

export const useCryptocurrencyData = () => {
  const [data, setData] = useState<CryptocurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}cryptocurrency`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const result = await SmartDataFetcher.fetchWithBackgroundRefresh(
          fetchCryptocurrencyData,
          storageKey,
          {
            forceRefresh,
            fallbackToCache: true,
          },
        );

        setData(result.data);
        setLastUpdated(result.lastUpdated);
        setIsCached(result.isCached);
        setRetryCount(result.retryCount);

        if (result.error && !result.isCached) {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data');
      } finally {
        setLoading(false);
      }
    },
    [storageKey],
  );

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchData(true);
    };

    const handleBackgroundRefresh = (event: CustomEvent) => {
      if (event.detail.key === storageKey) {
        fetchData(true);
      }
    };

    window.addEventListener('refresh-all-tiles', handleGlobalRefresh);
    window.addEventListener('background-refresh', handleBackgroundRefresh as EventListener);

    return () => {
      window.removeEventListener('refresh-all-tiles', handleGlobalRefresh);
      window.removeEventListener('background-refresh', handleBackgroundRefresh as EventListener);
    };
  }, [fetchData, storageKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVALS.TILE_DATA);

    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isCached,
    retryCount,
    refreshData,
  };
};
```

#### 4. Enhanced App Component with Storage Monitoring

Update the main App component to initialize smart storage monitoring:

```typescript
// src/App.tsx (enhanced)
import React, { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { smartStorage } from './utils/enhancedLocalStorage';
import { clearExpiredData } from './utils/localStorage';

function App() {
  useEffect(() => {
    // Initialize smart storage monitoring
    smartStorage.startMonitoring();

    // Clean up expired data on app start
    clearExpiredData();

    return () => {
      smartStorage.stopMonitoring();
    };
  }, []);

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
```

#### 5. Enhanced Error Handling and Offline Support

Create comprehensive error handling utilities:

```typescript
// src/utils/offlineSupport.ts
import { smartStorage } from './enhancedLocalStorage';

export interface OfflineStatus {
  isOnline: boolean;
  lastOnlineCheck: Date;
  cachedDataAvailable: boolean;
  storageMetrics: any;
}

export class OfflineSupport {
  private static instance: OfflineSupport;
  private onlineStatus: OfflineStatus = {
    isOnline: navigator.onLine,
    lastOnlineCheck: new Date(),
    cachedDataAvailable: false,
    storageMetrics: null,
  };

  static getInstance(): OfflineSupport {
    if (!OfflineSupport.instance) {
      OfflineSupport.instance = new OfflineSupport();
    }
    return OfflineSupport.instance;
  }

  initialize(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Check cached data availability
    this.checkCachedDataAvailability();

    // Update status periodically
    setInterval(() => {
      this.updateStatus();
    }, 30000); // Every 30 seconds
  }

  private handleOnline(): void {
    this.onlineStatus.isOnline = true;
    this.onlineStatus.lastOnlineCheck = new Date();

    // Trigger background refresh when coming back online
    setTimeout(() => {
      const event = new CustomEvent('online-restored');
      window.dispatchEvent(event);
    }, 1000);
  }

  private handleOffline(): void {
    this.onlineStatus.isOnline = false;
    this.onlineStatus.lastOnlineCheck = new Date();

    console.log('App is now offline, using cached data');
  }

  private checkCachedDataAvailability(): void {
    const metrics = smartStorage.getStorageMetrics();
    this.onlineStatus.cachedDataAvailable = metrics.tileCount > 0;
    this.onlineStatus.storageMetrics = metrics;
  }

  private updateStatus(): void {
    this.onlineStatus.isOnline = navigator.onLine;
    this.onlineStatus.lastOnlineCheck = new Date();
    this.checkCachedDataAvailability();
  }

  getStatus(): OfflineStatus {
    return { ...this.onlineStatus };
  }

  isOffline(): boolean {
    return !this.onlineStatus.isOnline;
  }

  hasCachedData(): boolean {
    return this.onlineStatus.cachedDataAvailable;
  }
}

export const offlineSupport = OfflineSupport.getInstance();
```

### Testing Requirements

#### Unit Tests

- **Coverage Target**: >80% for smart data management utilities
- **Test Files**:
  - `src/utils/enhancedLocalStorage.test.ts`
  - `src/utils/smartDataFetcher.test.ts`
  - `src/utils/offlineSupport.test.ts`
  - Updated tests for all enhanced hooks

#### Test Implementation

```typescript
// src/utils/enhancedLocalStorage.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartStorageManager, SMART_STORAGE_CONFIG } from './enhancedLocalStorage';

describe('SmartStorageManager', () => {
  let manager: SmartStorageManager;

  beforeEach(() => {
    localStorage.clear();
    manager = SmartStorageManager.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
    manager.stopMonitoring();
  });

  describe('getData', () => {
    it('should return cached data when available', async () => {
      const testData = { price: 50000 };
      const key = 'test-key';

      // Mock the setData method
      vi.spyOn(manager, 'setData').mockResolvedValue();

      await manager.setData(key, testData);
      const result = await manager.getData(key);

      expect(result).toEqual(testData);
    });

    it('should return null when no cached data', async () => {
      const result = await manager.getData('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Storage monitoring', () => {
    it('should start and stop monitoring', () => {
      expect(() => manager.startMonitoring()).not.toThrow();
      expect(() => manager.stopMonitoring()).not.toThrow();
    });

    it('should perform preventive cleanup when storage usage is high', async () => {
      // Mock high storage usage
      vi.spyOn(manager, 'getStorageMetrics').mockReturnValue({
        used: 4000000, // 4MB
        available: 1000000, // 1MB
        percentage: 80,
        tileCount: 10,
        oldestData: new Date(),
        newestData: new Date(),
      });

      const cleanupSpy = vi.spyOn(manager, 'performPreventiveCleanup');

      await manager.setData('test-key', { data: 'test' });

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});
```

### Performance Considerations

- **Background Refreshes**: Non-blocking data updates that don't affect UI responsiveness
- **Storage Optimization**: Intelligent cleanup to prevent browser storage limits
- **Retry Logic**: Exponential backoff to prevent API spam
- **Memory Management**: Proper cleanup of intervals and event listeners

### Accessibility Requirements

- **Offline Indicators**: Clear indication when app is offline
- **Error Communication**: Accessible error messages for all failure scenarios
- **Loading States**: Proper loading indicators for background operations
- **Screen Reader Support**: Announcements for data refresh and error states

### Risk Assessment

#### Technical Risks

- **Risk**: Storage limits exceeded despite cleanup mechanisms
  - **Impact**: Medium
  - **Mitigation**: Aggressive cleanup and storage monitoring

- **Risk**: Background refreshes causing performance issues
  - **Impact**: Low
  - **Mitigation**: Proper throttling and non-blocking operations

#### User Experience Risks

- **Risk**: Users not understanding offline functionality
  - **Impact**: Low
  - **Mitigation**: Clear offline indicators and helpful messaging

### Success Metrics

- **Offline Reliability**: Dashboard works 99% of the time even with API issues
- **Storage Efficiency**: Local storage usage stays under 80% of limits
- **Performance**: Background refreshes don't impact UI responsiveness
- **User Satisfaction**: Reduced complaints about data unavailability

### Implementation Checklist

- [ ] Create SmartStorageManager with intelligent cleanup and monitoring
- [ ] Implement SmartDataFetcher with retry logic and background refresh
- [ ] Update all tile hooks to use smart data fetching
- [ ] Add offline support with status monitoring
- [ ] Enhance App component with storage monitoring initialization
- [ ] Implement comprehensive error handling for all failure scenarios
- [ ] Add storage metrics and monitoring capabilities
- [ ] Create comprehensive unit tests for all new utilities
- [ ] Update existing hook tests to cover smart data management
- [ ] Test offline functionality and graceful degradation
- [ ] Verify storage cleanup mechanisms work correctly
- [ ] Test retry logic with various failure scenarios
- [ ] Ensure background refreshes don't block UI interactions
- [ ] Run full test suite to ensure no regressions
- [ ] Build and verify the application works correctly

### Documentation Requirements

- **Code Documentation**: JSDoc comments for all smart data management functions
- **User Documentation**: Explain offline functionality and data persistence
- **README Updates**: Document the new smart data management features

### Post-Implementation

- **Storage Monitoring**: Track storage usage and cleanup effectiveness
- **Offline Testing**: Verify dashboard works correctly when offline
- **Performance Monitoring**: Track background refresh performance impact
- **User Feedback**: Gather feedback on offline functionality and reliability
