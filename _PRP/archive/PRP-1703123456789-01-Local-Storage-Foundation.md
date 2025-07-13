# PRP-1703123456789-01-Local-Storage-Foundation

## Feature: Enhanced Data Management with Local Storage and Smart Refresh - Phase 1

### Overview

This PRP implements the foundation for enhanced data management by adding local storage capabilities to all tile data, extending refresh intervals to 10 minutes, and modifying data fetching to save responses to local storage.

### User Value

Users will experience faster dashboard loading on subsequent visits, reduced API calls, and better reliability when APIs are unavailable. The dashboard will remember data between browser sessions and page reloads.

### Functional Requirements

- [ ] Implement local storage utilities for tile data management
- [ ] Add 10-minute refresh interval constant to the constants system
- [ ] Modify all tile data fetching hooks to save responses to local storage
- [ ] Implement data age checking on page load
- [ ] Add background refresh for stale data
- [ ] Optimize local storage usage to prevent browser storage limits

### Non-Functional Requirements

- [ ] Dashboard loads within 2 seconds on subsequent visits
- [ ] Local storage usage is optimized to prevent browser storage limits
- [ ] Data older than 10 minutes triggers fresh API calls on page load
- [ ] Maintain existing error handling patterns

### Technical Implementation

#### 1. Local Storage Utilities

Create comprehensive local storage utilities in `src/utils/localStorage.ts`:

```typescript
// Local storage utilities for tile data management
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface LocalStorageConfig {
  maxAge: number; // 10 minutes in milliseconds
  cleanupInterval: number; // 1 hour in milliseconds
}

export const STORAGE_CONFIG: LocalStorageConfig = {
  maxAge: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 60 * 60 * 1000, // 1 hour
};

export const getCachedData = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const cached: CachedData<T> = JSON.parse(stored);
    const now = Date.now();

    if (now > cached.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
};

export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const now = Date.now();
    const cached: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + STORAGE_CONFIG.maxAge,
    };

    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
};

export const clearExpiredData = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith('tile-data-')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cached = JSON.parse(stored);
          if (now > cached.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired data:', error);
  }
};

export const getStorageUsage = (): { used: number; available: number } => {
  try {
    let used = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        used += new Blob([item]).size;
      }
    });

    // Estimate available storage (5MB is a safe default)
    const available = 5 * 1024 * 1024 - used;

    return { used, available };
  } catch (error) {
    console.warn('Failed to calculate storage usage:', error);
    return { used: 0, available: 0 };
  }
};
```

#### 2. Constants Update

Update `src/utils/constants.ts` to include the new refresh interval:

```typescript
// ... existing code ...

// Data refresh intervals
export const REFRESH_INTERVALS = {
  TILE_DATA: 10 * 60 * 1000, // 10 minutes
  COUNTDOWN_UPDATE: 1000, // 1 second for countdown timer
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TILE_DATA_PREFIX: 'tile-data-',
  DASHBOARD_CONFIG: 'dashboard-config',
} as const;

// ... existing code ...
```

#### 3. Enhanced Data Fetching Hooks

Update all tile data fetching hooks to use local storage. Example for `useCryptocurrencyData.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { getCachedData, setCachedData } from '../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../utils/constants';
import { CryptocurrencyData } from '../types';
import { fetchCryptocurrencyData } from '../services/coinGeckoApi';

export const useCryptocurrencyData = () => {
  const [data, setData] = useState<CryptocurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const storageKey = `${STORAGE_KEYS.TILE_DATA_PREFIX}cryptocurrency`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless forcing refresh
        if (!forceRefresh) {
          const cached = getCachedData<CryptocurrencyData>(storageKey);
          if (cached) {
            setData(cached);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const freshData = await fetchCryptocurrencyData();
        setData(freshData);
        setLastUpdated(new Date());

        // Cache the fresh data
        setCachedData(storageKey, freshData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data');
      } finally {
        setLoading(false);
      }
    },
    [storageKey],
  );

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
    refreshData,
  };
};
```

#### 4. Update All Tile Hooks

Apply similar patterns to all other tile data hooks:

- `usePreciousMetalsData.ts`
- `useFederalFundsRateData.ts`
- `useGDXETFData.ts`
- `useUraniumData.ts`
- `useEuriborRateData.ts`
- `useWeatherData.ts`
- `useTimeData.ts`

#### 5. Storage Cleanup

Add storage cleanup to the main App component:

```typescript
// In App.tsx or a dedicated cleanup utility
import { useEffect } from 'react';
import { clearExpiredData } from './utils/localStorage';

// Add to App component
useEffect(() => {
  // Clean up expired data on app start
  clearExpiredData();

  // Set up periodic cleanup
  const cleanupInterval = setInterval(clearExpiredData, 60 * 60 * 1000); // 1 hour

  return () => clearInterval(cleanupInterval);
}, []);
```

### Testing Requirements

#### Unit Tests

- **Coverage Target**: >80% for new local storage utilities
- **Test Files**:
  - `src/utils/localStorage.test.ts`
  - Updated tests for all modified hooks

#### Test Implementation

```typescript
// src/utils/localStorage.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCachedData, setCachedData, clearExpiredData, getStorageUsage } from './localStorage';

describe('Local Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setCachedData', () => {
    it('should store data with timestamp and expiration', () => {
      const testData = { price: 50000 };
      const key = 'test-key';

      setCachedData(key, testData);

      const stored = localStorage.getItem(key);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(testData);
      expect(parsed.timestamp).toBeTypeOf('number');
      expect(parsed.expiresAt).toBeTypeOf('number');
    });

    it('should handle storage errors gracefully', () => {
      const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const testData = { price: 50000 };

      expect(() => setCachedData('test-key', testData)).not.toThrow();

      mockSetItem.mockRestore();
    });
  });

  describe('getCachedData', () => {
    it('should return cached data if not expired', () => {
      const testData = { price: 50000 };
      const key = 'test-key';
      const now = Date.now();

      const cached = {
        data: testData,
        timestamp: now,
        expiresAt: now + 600000, // 10 minutes from now
      };

      localStorage.setItem(key, JSON.stringify(cached));

      const result = getCachedData(key);
      expect(result).toEqual(testData);
    });

    it('should return null for expired data', () => {
      const testData = { price: 50000 };
      const key = 'test-key';
      const now = Date.now();

      const cached = {
        data: testData,
        timestamp: now - 1200000, // 20 minutes ago
        expiresAt: now - 600000, // 10 minutes ago
      };

      localStorage.setItem(key, JSON.stringify(cached));

      const result = getCachedData(key);
      expect(result).toBeNull();
    });

    it('should return null for non-existent data', () => {
      const result = getCachedData('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('clearExpiredData', () => {
    it('should remove expired tile data', () => {
      const now = Date.now();

      // Add expired data
      const expiredData = {
        data: { price: 50000 },
        timestamp: now - 1200000,
        expiresAt: now - 600000,
      };
      localStorage.setItem('tile-data-expired', JSON.stringify(expiredData));

      // Add valid data
      const validData = {
        data: { price: 50000 },
        timestamp: now,
        expiresAt: now + 600000,
      };
      localStorage.setItem('tile-data-valid', JSON.stringify(validData));

      clearExpiredData();

      expect(localStorage.getItem('tile-data-expired')).toBeNull();
      expect(localStorage.getItem('tile-data-valid')).toBeTruthy();
    });
  });
});
```

### Performance Considerations

- **Storage Size**: Monitor local storage usage to prevent hitting browser limits
- **Cache Invalidation**: Implement proper cache expiration to prevent stale data
- **Memory Usage**: Clean up expired data regularly to prevent memory leaks
- **API Call Reduction**: Reduce unnecessary API calls by 90% through caching

### Accessibility Requirements

- **Screen Reader Support**: Ensure cached data loading is properly announced
- **Keyboard Navigation**: Maintain existing keyboard accessibility patterns
- **Error Communication**: Clear error messages when cache operations fail

### Risk Assessment

#### Technical Risks

- **Risk**: Local storage limits exceeded with large datasets
  - **Impact**: Medium
  - **Mitigation**: Implement data cleanup and size monitoring

- **Risk**: Stale data causing user confusion
  - **Impact**: Low
  - **Mitigation**: Clear visual indicators for data freshness

#### User Experience Risks

- **Risk**: Users not understanding cached vs fresh data
  - **Impact**: Medium
  - **Mitigation**: Clear UI indicators and helpful tooltips

### Success Metrics

- **Dashboard Load Time**: Reduced from current time to under 2 seconds
- **API Call Reduction**: 90% reduction in unnecessary API calls
- **Local Storage Usage**: Efficient use of browser storage
- **Error Rate**: Clear error handling for all failure scenarios

### Implementation Checklist

- [ ] Create local storage utilities with comprehensive error handling
- [ ] Update constants to include 10-minute refresh interval
- [ ] Modify all tile data fetching hooks to use local storage
- [ ] Implement data age checking on page load
- [ ] Add background refresh for stale data
- [ ] Optimize local storage usage to prevent browser storage limits
- [ ] Add comprehensive unit tests for local storage utilities
- [ ] Update existing hook tests to cover new caching behavior
- [ ] Add storage cleanup functionality to main app
- [ ] Test with various data sizes to ensure storage limits are respected
- [ ] Verify all existing functionality continues to work with caching
- [ ] Run full test suite to ensure no regressions
- [ ] Build and verify the application works correctly

### Documentation Requirements

- **Code Documentation**: JSDoc comments for all new local storage functions
- **README Updates**: Document the new caching behavior
- **User Documentation**: Explain the new data persistence features

### Post-Implementation

- **Monitoring**: Track local storage usage and cache hit rates
- **Performance**: Monitor dashboard load times and API call reduction
- **User Feedback**: Gather feedback on perceived performance improvements
