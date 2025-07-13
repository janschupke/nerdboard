# PRP-1703123456789-04: Sidebar Persistence and Tile Count Display

## Feature Overview

Implement local storage persistence for sidebar state and add tile count display in the sidebar title, ensuring user preferences are saved and restored across sessions.

## User-Facing Description

Users will see the total number of available tiles displayed in the sidebar title (e.g., "Available Tiles (12)"). Their sidebar preferences, including which tiles are active and the sidebar collapse state, will be automatically saved and restored when they return to the dashboard. This provides a seamless experience where users don't lose their dashboard configuration between sessions.

## Functional Requirements

### Core Functionality

1. **Tile Count Display**
   - Sidebar title shows total count of available tiles
   - Format: "Available Tiles (X)" where X is the count
   - Count updates automatically if tile list changes
   - Clear, prominent display in sidebar header

2. **Sidebar State Persistence**
   - Active tiles list saved to local storage
   - Sidebar collapse/expand state saved to local storage
   - State automatically restored on page load
   - Graceful handling of corrupted or missing data

3. **Local Storage Management**
   - Efficient storage operations
   - Data validation and error handling
   - Automatic cleanup of old data
   - Fallback mechanisms for storage failures

4. **State Synchronization**
   - Real-time sync between memory and storage
   - Optimistic updates for better UX
   - Conflict resolution for concurrent changes
   - Data integrity validation

### Technical Requirements

1. **Storage Implementation**
   - Use browser localStorage API
   - Implement proper error handling
   - Add data validation and sanitization
   - Ensure cross-browser compatibility

2. **Performance Optimization**
   - Debounce storage operations
   - Minimize storage read/write operations
   - Implement efficient data serialization
   - Cache frequently accessed data

3. **Error Handling**
   - Graceful fallback for storage failures
   - User-friendly error messages
   - Automatic retry mechanisms
   - Data recovery procedures

## Technical Implementation

### Local Storage Service

```typescript
// src/utils/sidebarStorage.ts
export interface SidebarState {
  activeTiles: string[];
  isCollapsed: boolean;
  lastUpdated: number;
}

export interface SidebarStorageService {
  saveSidebarState: (state: SidebarState) => Promise<void>;
  loadSidebarState: () => Promise<SidebarState | null>;
  clearSidebarState: () => Promise<void>;
  isValidState: (state: any) => state is SidebarState;
}

class SidebarStorageServiceImpl implements SidebarStorageService {
  private readonly STORAGE_KEY = 'nerdboard-sidebar-state';
  private readonly MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  async saveSidebarState(state: SidebarState): Promise<void> {
    try {
      const dataToSave = {
        ...state,
        lastUpdated: Date.now(),
      };
      
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
      throw new Error('Failed to save sidebar preferences');
    }
  }

  async loadSidebarState(): Promise<SidebarState | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      if (!this.isValidState(parsed)) {
        console.warn('Invalid sidebar state found, clearing...');
        await this.clearSidebarState();
        return null;
      }

      // Check if data is too old
      if (Date.now() - parsed.lastUpdated > this.MAX_AGE_MS) {
        console.warn('Sidebar state is too old, clearing...');
        await this.clearSidebarState();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
      return null;
    }
  }

  async clearSidebarState(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sidebar state:', error);
    }
  }

  isValidState(state: any): state is SidebarState {
    return (
      state &&
      typeof state === 'object' &&
      Array.isArray(state.activeTiles) &&
      state.activeTiles.every((tile: any) => typeof tile === 'string') &&
      typeof state.isCollapsed === 'boolean' &&
      typeof state.lastUpdated === 'number'
    );
  }
}

export const sidebarStorage = new SidebarStorageServiceImpl();
```

### Enhanced Dashboard Context with Persistence

```typescript
// src/contexts/DashboardContext.tsx
import { sidebarStorage, SidebarState } from '../utils/sidebarStorage';

interface DashboardContextType {
  activeTiles: string[];
  setActiveTiles: (tiles: string[]) => void;
  toggleTile: (tileId: string) => Promise<void>;
  isTileActive: (tileId: string) => boolean;
  addTile: (tileId: string) => Promise<void>;
  removeTile: (tileId: string) => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTiles, setActiveTiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state on mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        const savedState = await sidebarStorage.loadSidebarState();
        if (savedState) {
          setActiveTiles(savedState.activeTiles);
        }
      } catch (error) {
        console.error('Failed to initialize sidebar state:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeState();
  }, []);

  // Save state when activeTiles changes
  useEffect(() => {
    if (!isInitialized) return;

    const saveState = async () => {
      try {
        await sidebarStorage.saveSidebarState({
          activeTiles,
          isCollapsed: false, // This will be managed by sidebar component
          lastUpdated: Date.now(),
        });
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
      }
    };

    // Debounce save operations
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [activeTiles, isInitialized]);

  const toggleTile = useCallback(async (tileId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      setActiveTiles(prev => {
        if (prev.includes(tileId)) {
          return prev.filter(id => id !== tileId);
        } else {
          return [...prev, tileId];
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const addTile = useCallback(async (tileId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (!activeTiles.includes(tileId)) {
        setActiveTiles(prev => [...prev, tileId]);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsLoading(false);
    }
  }, [activeTiles, isLoading]);

  const removeTile = useCallback(async (tileId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      setActiveTiles(prev => prev.filter(id => id !== tileId));
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const isTileActive = useCallback((tileId: string) => {
    return activeTiles.includes(tileId);
  }, [activeTiles]);

  const saveState = useCallback(async () => {
    try {
      await sidebarStorage.saveSidebarState({
        activeTiles,
        isCollapsed: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }, [activeTiles]);

  const loadState = useCallback(async () => {
    try {
      const savedState = await sidebarStorage.loadSidebarState();
      if (savedState) {
        setActiveTiles(savedState.activeTiles);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
      throw error;
    }
  }, []);

  const value: DashboardContextType = {
    activeTiles,
    setActiveTiles,
    toggleTile,
    isTileActive,
    addTile,
    removeTile,
    isLoading,
    isInitialized,
    saveState,
    loadState,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
```

### Enhanced Sidebar with Tile Count and Persistence

```typescript
// src/components/dashboard/Sidebar.tsx
import React, { useMemo, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { sidebarStorage } from '../../utils/sidebarStorage';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { activeTiles, toggleTile, isInitialized } = useDashboard();
  
  const sidebarItems = useMemo(() => [
    { id: 'cryptocurrency', label: 'Cryptocurrency', icon: '💰' },
    { id: 'precious-metals', label: 'Precious Metals', icon: '🥇' },
    { id: 'federal-funds-rate', label: 'Federal Funds Rate', icon: '📊' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'time', label: 'Time', icon: '🕐' },
    { id: 'uranium', label: 'Uranium', icon: '⚛️' },
    { id: 'gdx-etf', label: 'GDX ETF', icon: '📈' },
    { id: 'euribor-rate', label: 'Euribor Rate', icon: '🏦' },
  ], []);

  // Save sidebar collapse state
  useEffect(() => {
    const saveCollapseState = async () => {
      try {
        const currentState = await sidebarStorage.loadSidebarState();
        if (currentState) {
          await sidebarStorage.saveSidebarState({
            ...currentState,
            isCollapsed: isCollapsed,
            lastUpdated: Date.now(),
          });
        }
      } catch (error) {
        console.error('Failed to save sidebar collapse state:', error);
      }
    };

    if (isInitialized) {
      saveCollapseState();
    }
  }, [isCollapsed, isInitialized]);

  // Load sidebar collapse state on mount
  useEffect(() => {
    const loadCollapseState = async () => {
      try {
        const savedState = await sidebarStorage.loadSidebarState();
        if (savedState && savedState.isCollapsed !== isCollapsed) {
          // Trigger sidebar toggle if state doesn't match
          onToggle();
        }
      } catch (error) {
        console.error('Failed to load sidebar collapse state:', error);
      }
    };

    if (isInitialized) {
      loadCollapseState();
    }
  }, [isInitialized, isCollapsed, onToggle]);

  const handleTileToggle = useCallback(async (tileId: string) => {
    try {
      await toggleTile(tileId);
    } catch (error) {
      console.error('Failed to toggle tile:', error);
    }
  }, [toggleTile]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          Available Tiles ({sidebarItems.length})
        </h2>
        <button 
          onClick={onToggle} 
          className="sidebar-toggle"
          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} sidebar`}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav" role="navigation" aria-label="Available tiles">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeTiles.includes(item.id)}
            onClick={() => handleTileToggle(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};
```

### Storage Error Boundary

```typescript
// src/components/dashboard/SidebarStorageErrorBoundary.tsx
import React, { useState } from 'react';

interface SidebarStorageErrorBoundaryProps {
  children: React.ReactNode;
}

export const SidebarStorageErrorBoundary: React.FC<SidebarStorageErrorBoundaryProps> = ({ children }) => {
  const [hasStorageError, setHasStorageError] = useState(false);

  if (hasStorageError) {
    return (
      <div className="storage-error-notification">
        <div className="error-content">
          <p>Unable to save sidebar preferences. Your changes may not persist between sessions.</p>
          <button 
            onClick={() => setHasStorageError(false)}
            className="error-dismiss"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasStorageError(true)}>
      {children}
    </ErrorBoundary>
  );
};
```

### Storage Status Indicator

```typescript
// src/components/dashboard/StorageStatusIndicator.tsx
import React, { useState, useEffect } from 'react';

export const StorageStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="storage-status offline">
        <span className="status-icon">⚠️</span>
        <span className="status-text">Offline - changes may not save</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="storage-status saved">
        <span className="status-icon">✓</span>
        <span className="status-text">Saved</span>
      </div>
    );
  }

  return null;
};
```

## Testing Requirements

### Unit Tests

1. **Storage Service Tests**
   - Test save/load operations
   - Test data validation
   - Test error handling
   - Test data cleanup

2. **Dashboard Context Tests**
   - Test state persistence
   - Test initialization
   - Test error recovery
   - Test debouncing

3. **Sidebar Component Tests**
   - Test tile count display
   - Test collapse state persistence
   - Test error boundaries
   - Test status indicators

### Integration Tests

1. **Storage Integration**
   - Test complete save/load cycle
   - Test data integrity
   - Test error scenarios
   - Test performance under load

2. **User Experience Tests**
   - Test state restoration on page reload
   - Test offline behavior
   - Test error recovery
   - Test performance impact

### Test Coverage Requirements

- **Storage Service**: >95% for all storage operations
- **Context Integration**: >90% for persistence logic
- **Component Integration**: >85% for UI components
- **Error Handling**: >90% for error scenarios

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Storage Status**
   - Clear indication of save status
   - Announcements for storage errors
   - Alternative text for status icons

2. **Error Handling**
   - Clear error messages
   - Recovery instructions
   - Non-blocking error states

3. **Loading States**
   - Indicate when data is loading
   - Show initialization progress
   - Maintain accessibility during loading

### Screen Reader Support

```typescript
// Announcements for storage operations
export const announceStorageStatus = (status: 'saving' | 'saved' | 'error') => {
  const messages = {
    saving: 'Saving sidebar preferences...',
    saved: 'Sidebar preferences saved',
    error: 'Failed to save sidebar preferences',
  };

  const liveRegion = document.getElementById('storage-announcements');
  if (liveRegion) {
    liveRegion.textContent = messages[status];
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 2000);
  }
};
```

## Performance Requirements

### Performance Benchmarks

- **Storage Operations**: < 100ms for save/load operations
- **State Restoration**: < 200ms for complete state restoration
- **UI Updates**: < 50ms for tile count updates
- **Error Recovery**: < 500ms for error handling

### Optimization Strategies

- **Debouncing**: Prevent excessive storage writes
- **Caching**: Cache frequently accessed data
- **Lazy Loading**: Defer non-critical operations
- **Compression**: Optimize storage data size

## Error Handling

### Error Scenarios

1. **Storage Failures**
   - Quota exceeded
   - Browser storage disabled
   - Corrupted data
   - Network issues

2. **Data Validation Errors**
   - Invalid data format
   - Missing required fields
   - Type mismatches
   - Version conflicts

3. **Performance Issues**
   - Large data sets
   - Frequent updates
   - Memory leaks
   - Slow storage operations

### Error Recovery

```typescript
// Comprehensive error handling for storage operations
export const handleStorageError = async (error: Error, operation: string) => {
  console.error(`Storage error during ${operation}:`, error);

  // Try to recover based on error type
  if (error.name === 'QuotaExceededError') {
    // Clear old data and retry
    await sidebarStorage.clearSidebarState();
    return 'Storage cleared, please try again';
  }

  if (error.name === 'SecurityError') {
    // Browser storage disabled
    return 'Storage is disabled in your browser';
  }

  // Generic error
  return 'Unable to save preferences';
};
```

## Success Criteria

### Functional Success

- [ ] Tile count displays correctly in sidebar title
- [ ] Sidebar state persists across page reloads
- [ ] Active tiles list is saved and restored
- [ ] Collapse state is preserved
- [ ] Error handling works gracefully

### Technical Success

- [ ] Storage operations complete within 100ms
- [ ] State restoration completes within 200ms
- [ ] Test coverage > 90% for storage operations
- [ ] No console errors during normal operation
- [ ] Cross-browser compatibility

### User Experience Success

- [ ] Users see tile count immediately
- [ ] Preferences persist between sessions
- [ ] No data loss on page refresh
- [ ] Clear feedback for storage operations
- [ ] Graceful error handling

## Risk Mitigation

### Technical Risks

1. **Storage Limitations**
   - Implement data compression
   - Add cleanup mechanisms
   - Monitor storage usage
   - Provide fallback options

2. **Performance Issues**
   - Optimize storage operations
   - Implement caching
   - Debounce frequent updates
   - Monitor performance metrics

3. **Data Corruption**
   - Implement data validation
   - Add backup mechanisms
   - Provide recovery options
   - Test error scenarios

### User Experience Risks

1. **Data Loss**
   - Implement auto-save
   - Add manual save options
   - Provide data export
   - Clear error messaging

2. **Performance Impact**
   - Optimize for speed
   - Add loading indicators
   - Implement progressive enhancement
   - Monitor user feedback

## Implementation Checklist

### Phase 1: Storage Foundation
- [ ] Implement storage service
- [ ] Add data validation
- [ ] Create error handling
- [ ] Test basic operations

### Phase 2: Context Integration
- [ ] Integrate with dashboard context
- [ ] Add state persistence
- [ ] Implement debouncing
- [ ] Test integration

### Phase 3: UI Enhancement
- [ ] Add tile count display
- [ ] Implement status indicators
- [ ] Add error boundaries
- [ ] Test UI components

### Phase 4: Polish and Testing
- [ ] Add comprehensive tests
- [ ] Optimize performance
- [ ] Ensure accessibility
- [ ] Document implementation

## Dependencies

### Internal Dependencies
- PRP-1703123456789-01 (Sidebar Visual State Management)
- PRP-1703123456789-02 (Sidebar Interactive Functionality)
- PRP-1703123456789-03 (Sidebar Keyboard Navigation)
- Existing dashboard context
- Error boundary components

### External Dependencies
- React 19
- TypeScript
- Browser localStorage API

## Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 1-2 hours
- **Phase 4**: 1-2 hours

**Total Estimated Time**: 6-10 hours 
