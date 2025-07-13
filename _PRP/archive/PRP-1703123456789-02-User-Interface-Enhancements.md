# PRP-1703123456789-02-User-Interface-Enhancements

## Feature: Enhanced Data Management with Local Storage and Smart Refresh - Phase 2

### Overview

This PRP implements user interface enhancements to provide users with visibility into data refresh timing and control over data updates. This includes adding a countdown timer to the top panel, a manual refresh button, and improved error message display within tiles.

### User Value

Users will have clear visibility into when their data will next refresh, the ability to manually refresh all data when needed, and better understanding of data availability through improved error messages.

### Functional Requirements

- [ ] Add countdown timer to top panel showing time until next full refresh
- [ ] Add manual refresh button to top panel for immediate data update
- [ ] Implement error message display within tiles when data is unavailable
- [ ] Show visual indicators for cached vs fresh data
- [ ] Display last updated timestamp for each tile
- [ ] Provide helpful tooltips explaining countdown timer and refresh functionality

### Non-Functional Requirements

- [ ] Countdown timer updates in real-time (every second)
- [ ] Error messages are user-friendly and explain the situation clearly
- [ ] All new UI elements are fully accessible via keyboard navigation
- [ ] Screen reader support for countdown timer and refresh button
- [ ] Maintain existing visual design consistency

### Technical Implementation

#### 1. Enhanced Top Panel Component

Create a new enhanced top panel component that includes countdown timer and refresh button:

```typescript
// src/components/dashboard/EnhancedTopPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { REFRESH_INTERVALS } from '../../utils/constants';

interface EnhancedTopPanelProps {
  onRefreshAll: () => void;
  isRefreshing?: boolean;
  lastRefreshTime?: Date;
}

export const EnhancedTopPanel: React.FC<EnhancedTopPanelProps> = ({
  onRefreshAll,
  isRefreshing = false,
  lastRefreshTime,
}) => {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(0);

  const calculateTimeUntilRefresh = useCallback(() => {
    if (!lastRefreshTime) {
      setTimeUntilRefresh(REFRESH_INTERVALS.TILE_DATA);
      return;
    }

    const now = Date.now();
    const nextRefresh = lastRefreshTime.getTime() + REFRESH_INTERVALS.TILE_DATA;
    const timeLeft = Math.max(0, nextRefresh - now);

    setTimeUntilRefresh(timeLeft);
  }, [lastRefreshTime]);

  useEffect(() => {
    calculateTimeUntilRefresh();

    const interval = setInterval(calculateTimeUntilRefresh, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeUntilRefresh]);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefreshClick = useCallback(() => {
    onRefreshAll();
  }, [onRefreshAll]);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Nerdboard
        </h1>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon name="clock" className="w-4 h-4" />
          <span>Next refresh in: {formatTime(timeUntilRefresh)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center space-x-2"
          aria-label="Refresh all data"
          title="Refresh all dashboard data immediately"
        >
          <Icon
            name={isRefreshing ? "loading" : "refresh"}
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh All'}</span>
        </Button>
      </div>
    </div>
  );
};
```

#### 2. Enhanced Tile Component with Error Display

Update the base Tile component to include better error handling and data freshness indicators:

```typescript
// src/components/dashboard/Tile.tsx (enhanced)
import React from 'react';
import { Icon } from '../ui/Icon';

interface TileProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date;
  isCached?: boolean;
  className?: string;
}

export const Tile: React.FC<TileProps> = ({
  title,
  children,
  loading = false,
  error = null,
  lastUpdated,
  isCached = false,
  className = '',
}) => {
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>

          <div className="flex items-center space-x-2">
            {isCached && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="database" className="w-3 h-3" />
                <span>Cached</span>
              </div>
            )}

            {lastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Icon name="loading" className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Icon name="alert-circle" className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Unable to load data
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {error}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Showing cached data if available
              </p>
            </div>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
};
```

#### 3. Enhanced Dashboard Component

Update the main Dashboard component to integrate the new top panel and refresh functionality:

```typescript
// src/components/dashboard/Dashboard.tsx (enhanced)
import React, { useState, useCallback, useEffect } from 'react';
import { EnhancedTopPanel } from './EnhancedTopPanel';
import { TileGrid } from './TileGrid';
import { Sidebar } from './Sidebar';
import { useDashboard } from '../../hooks/useDashboard';

export const Dashboard: React.FC = () => {
  const { tiles, refreshAllTiles, isRefreshing, lastRefreshTime } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRefreshAll = useCallback(async () => {
    await refreshAllTiles();
  }, [refreshAllTiles]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      <div className="flex-1 flex flex-col">
        <EnhancedTopPanel
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime}
        />

        <main className="flex-1 overflow-auto p-4">
          <TileGrid tiles={tiles} />
        </main>
      </div>
    </div>
  );
};
```

#### 4. Enhanced Dashboard Hook

Update the useDashboard hook to support the new refresh functionality:

```typescript
// src/hooks/useDashboard.ts (enhanced)
import { useState, useCallback, useEffect } from 'react';
import { Tile } from '../types/dashboard';
import { useLocalStorage } from './useLocalStorage';

export const useDashboard = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const { getItem, setItem } = useLocalStorage();

  const refreshAllTiles = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Trigger refresh for all tiles
      // This will be implemented by individual tile hooks
      const event = new CustomEvent('refresh-all-tiles');
      window.dispatchEvent(event);

      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Failed to refresh all tiles:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load dashboard configuration from local storage
  useEffect(() => {
    const savedTiles = getItem('dashboard-tiles');
    if (savedTiles) {
      setTiles(savedTiles);
    }
  }, [getItem]);

  // Save dashboard configuration to local storage
  useEffect(() => {
    if (tiles.length > 0) {
      setItem('dashboard-tiles', tiles);
    }
  }, [tiles, setItem]);

  return {
    tiles,
    setTiles,
    refreshAllTiles,
    isRefreshing,
    lastRefreshTime,
  };
};
```

#### 5. Enhanced Tile Hooks with Refresh Support

Update all tile hooks to support the global refresh event:

```typescript
// Example: src/components/dashboard/tiles/cryptocurrency/hooks/useCryptocurrencyData.ts (enhanced)
import { useState, useEffect, useCallback } from 'react';
import { getCachedData, setCachedData } from '../../../../utils/localStorage';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../../../../utils/constants';
import { CryptocurrencyData } from '../types';
import { fetchCryptocurrencyData } from '../services/coinGeckoApi';

export const useCryptocurrencyData = () => {
  const [data, setData] = useState<CryptocurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

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
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const freshData = await fetchCryptocurrencyData();
        setData(freshData);
        setLastUpdated(new Date());
        setIsCached(false);

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

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchData(true);
    };

    window.addEventListener('refresh-all-tiles', handleGlobalRefresh);

    return () => {
      window.removeEventListener('refresh-all-tiles', handleGlobalRefresh);
    };
  }, [fetchData]);

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
    refreshData,
  };
};
```

#### 6. Enhanced Icon Component

Add new icons for the enhanced UI:

```typescript
// src/components/ui/Icon.tsx (enhanced)
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  const getIconPath = (iconName: string): string => {
    const icons: Record<string, string> = {
      // Existing icons...
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      loading: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      'alert-circle': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      // ... other icons
    };

    return icons[iconName] || '';
  };

  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={getIconPath(name)}
      />
    </svg>
  );
};
```

### Testing Requirements

#### Unit Tests

- **Coverage Target**: >80% for new UI components
- **Test Files**:
  - `src/components/dashboard/EnhancedTopPanel.test.tsx`
  - `src/components/dashboard/Tile.test.tsx` (updated)
  - `src/hooks/useDashboard.test.ts` (updated)

#### Test Implementation

```typescript
// src/components/dashboard/EnhancedTopPanel.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedTopPanel } from './EnhancedTopPanel';

describe('EnhancedTopPanel', () => {
  const mockOnRefreshAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render countdown timer', () => {
    render(
      <EnhancedTopPanel
        onRefreshAll={mockOnRefreshAll}
        lastRefreshTime={new Date()}
      />
    );

    expect(screen.getByText(/Next refresh in:/)).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    render(
      <EnhancedTopPanel
        onRefreshAll={mockOnRefreshAll}
        lastRefreshTime={new Date()}
      />
    );

    expect(screen.getByRole('button', { name: /Refresh all data/i })).toBeInTheDocument();
  });

  it('should call onRefreshAll when refresh button is clicked', () => {
    render(
      <EnhancedTopPanel
        onRefreshAll={mockOnRefreshAll}
        lastRefreshTime={new Date()}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /Refresh all data/i });
    fireEvent.click(refreshButton);

    expect(mockOnRefreshAll).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when refreshing', () => {
    render(
      <EnhancedTopPanel
        onRefreshAll={mockOnRefreshAll}
        isRefreshing={true}
        lastRefreshTime={new Date()}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /Refresh all data/i });
    expect(refreshButton).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });

  it('should update countdown timer in real-time', async () => {
    vi.useFakeTimers();

    render(
      <EnhancedTopPanel
        onRefreshAll={mockOnRefreshAll}
        lastRefreshTime={new Date()}
      />
    );

    const initialText = screen.getByText(/Next refresh in:/).textContent;

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      const updatedText = screen.getByText(/Next refresh in:/).textContent;
      expect(updatedText).not.toBe(initialText);
    });

    vi.useRealTimers();
  });
});
```

### Performance Considerations

- **Countdown Updates**: Optimize countdown timer to update only when necessary
- **Event Handling**: Efficient global refresh event handling
- **Memory Usage**: Proper cleanup of event listeners and intervals
- **Render Optimization**: Use React.memo for expensive components

### Accessibility Requirements

- **Screen Reader Support**: Proper ARIA labels for countdown timer and refresh button
- **Keyboard Navigation**: Full keyboard accessibility for all new controls
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Communication**: Accessible error messages and status updates

### Risk Assessment

#### Technical Risks

- **Risk**: Countdown timer causing performance issues with frequent updates
  - **Impact**: Low
  - **Mitigation**: Optimize timer updates and use requestAnimationFrame

- **Risk**: Global refresh events causing race conditions
  - **Impact**: Medium
  - **Mitigation**: Proper event handling and state management

#### User Experience Risks

- **Risk**: Users not understanding the countdown timer
  - **Impact**: Low
  - **Mitigation**: Clear labeling and helpful tooltips

### Success Metrics

- **User Understanding**: Users can successfully use refresh controls
- **Error Handling**: Clear error messages improve user experience
- **Accessibility**: All new features are fully accessible
- **Performance**: Countdown timer updates smoothly without performance impact

### Implementation Checklist

- [ ] Create EnhancedTopPanel component with countdown timer and refresh button
- [ ] Update Tile component with error display and data freshness indicators
- [ ] Enhance Dashboard component to integrate new top panel
- [ ] Update useDashboard hook with refresh functionality
- [ ] Modify all tile hooks to support global refresh events
- [ ] Add new icons for enhanced UI elements
- [ ] Implement comprehensive unit tests for new components
- [ ] Update existing component tests to cover new functionality
- [ ] Ensure all new UI elements are fully accessible
- [ ] Test countdown timer accuracy and performance
- [ ] Verify error handling works correctly across all tiles
- [ ] Test global refresh functionality with all tile types
- [ ] Run full test suite to ensure no regressions
- [ ] Build and verify the application works correctly

### Documentation Requirements

- **Code Documentation**: JSDoc comments for all new components and functions
- **User Documentation**: Tooltips and help text for new features
- **README Updates**: Document the new UI enhancements

### Post-Implementation

- **User Testing**: Gather feedback on countdown timer and refresh functionality
- **Performance Monitoring**: Track countdown timer performance impact
- **Accessibility Testing**: Verify all new features work with screen readers
