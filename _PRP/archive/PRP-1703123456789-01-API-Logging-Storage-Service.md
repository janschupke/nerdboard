# PRP-1703123456789-01-API-Logging-Storage-Service

## Feature: API Logging Storage Service

### Overview

Implement the foundational storage service for the API logging system that captures, stores, and manages API warnings and errors in local storage with automatic cleanup.

### Functional Requirements

- [ ] Create log storage service for local storage management
- [ ] Implement automatic log cleanup (1-hour age limit)
- [ ] Store logs with timestamp, API call details, and failure reason
- [ ] Prevent API errors from appearing in browser console
- [ ] Handle storage errors gracefully

### Technical Implementation

#### 1. Create Log Storage Service

**File**: `src/services/logStorageService.ts`

```typescript
export interface APILogEntry {
  id: string;
  timestamp: number;
  level: 'warning' | 'error';
  apiCall: string;
  reason: string;
  details?: Record<string, any>;
}

export interface LogStorageService {
  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>): void;
  getLogs(): APILogEntry[];
  removeLog(id: string): void;
  clearLogs(): void;
  cleanupOldLogs(): void;
}

class APILogStorageService implements LogStorageService {
  private readonly STORAGE_KEY = 'nerdboard_api_logs';
  private readonly MAX_AGE_HOURS = 1;

  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>): void {
    try {
      const logs = this.getLogs();
      const newLog: APILogEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now(),
      };
      
      logs.unshift(newLog);
      this.saveLogs(logs);
      this.cleanupOldLogs();
    } catch (error) {
      console.warn('Failed to add API log:', error);
    }
  }

  getLogs(): APILogEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve API logs:', error);
      return [];
    }
  }

  removeLog(id: string): void {
    try {
      const logs = this.getLogs();
      const filteredLogs = logs.filter(log => log.id !== id);
      this.saveLogs(filteredLogs);
    } catch (error) {
      console.warn('Failed to remove API log:', error);
    }
  }

  clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear API logs:', error);
    }
  }

  cleanupOldLogs(): void {
    try {
      const logs = this.getLogs();
      const cutoffTime = Date.now() - (this.MAX_AGE_HOURS * 60 * 60 * 1000);
      const filteredLogs = logs.filter(log => log.timestamp > cutoffTime);
      
      if (filteredLogs.length !== logs.length) {
        this.saveLogs(filteredLogs);
      }
    } catch (error) {
      console.warn('Failed to cleanup old API logs:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveLogs(logs: APILogEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }
}

export const logStorageService = new APILogStorageService();
```

#### 2. Create Log Context for State Management

**File**: `src/contexts/LogContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APILogEntry, logStorageService } from '../services/logStorageService';

interface LogContextType {
  logs: APILogEntry[];
  addLog: (entry: Omit<APILogEntry, 'id' | 'timestamp'>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  refreshLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
};

interface LogProviderProps {
  children: React.ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<APILogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    setLogs(logStorageService.getLogs());
  }, []);

  const addLog = useCallback((entry: Omit<APILogEntry, 'id' | 'timestamp'>) => {
    logStorageService.addLog(entry);
    refreshLogs();
  }, [refreshLogs]);

  const removeLog = useCallback((id: string) => {
    logStorageService.removeLog(id);
    refreshLogs();
  }, [refreshLogs]);

  const clearLogs = useCallback(() => {
    logStorageService.clearLogs();
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const value: LogContextType = {
    logs,
    addLog,
    removeLog,
    clearLogs,
    refreshLogs,
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};
```

#### 3. Create API Error Interceptor

**File**: `src/services/apiErrorInterceptor.ts`

```typescript
import { logStorageService } from './logStorageService';

export interface APIError {
  apiCall: string;
  reason: string;
  details?: Record<string, any>;
}

export const interceptAPIError = (error: APIError): void => {
  // Prevent error from appearing in console
  const originalConsoleError = console.error;
  console.error = () => {}; // Temporarily suppress console.error
  
  // Log the error to our storage system
  logStorageService.addLog({
    level: 'error',
    apiCall: error.apiCall,
    reason: error.reason,
    details: error.details,
  });
  
  // Restore console.error
  console.error = originalConsoleError;
};

export const interceptAPIWarning = (warning: APIError): void => {
  // Prevent warning from appearing in console
  const originalConsoleWarn = console.warn;
  console.warn = () => {}; // Temporarily suppress console.warn
  
  // Log the warning to our storage system
  logStorageService.addLog({
    level: 'warning',
    apiCall: warning.apiCall,
    reason: warning.reason,
    details: warning.details,
  });
  
  // Restore console.warn
  console.warn = originalConsoleWarn;
};
```

### Testing Requirements

#### Unit Tests

**File**: `src/services/logStorageService.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logStorageService, APILogEntry } from './logStorageService';

describe('APILogStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should add log entry with generated id and timestamp', () => {
    const entry = {
      level: 'error' as const,
      apiCall: 'test-api',
      reason: 'Test error',
    };

    logStorageService.addLog(entry);
    const logs = logStorageService.getLogs();

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject(entry);
    expect(logs[0].id).toBeDefined();
    expect(logs[0].timestamp).toBeDefined();
  });

  it('should remove log by id', () => {
    const entry = {
      level: 'warning' as const,
      apiCall: 'test-api',
      reason: 'Test warning',
    };

    logStorageService.addLog(entry);
    const logs = logStorageService.getLogs();
    const logId = logs[0].id;

    logStorageService.removeLog(logId);
    const updatedLogs = logStorageService.getLogs();

    expect(updatedLogs).toHaveLength(0);
  });

  it('should cleanup logs older than 1 hour', () => {
    const oldEntry = {
      level: 'error' as const,
      apiCall: 'old-api',
      reason: 'Old error',
    };

    const newEntry = {
      level: 'warning' as const,
      apiCall: 'new-api',
      reason: 'New warning',
    };

    // Add old log (simulate old timestamp)
    const oldLog: APILogEntry = {
      ...oldEntry,
      id: 'old-id',
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    };

    const logs = [oldLog];
    localStorage.setItem('nerdboard_api_logs', JSON.stringify(logs));

    // Add new log (should trigger cleanup)
    logStorageService.addLog(newEntry);
    const updatedLogs = logStorageService.getLogs();

    expect(updatedLogs).toHaveLength(2); // New log + cleanup
    expect(updatedLogs.find(log => log.id === 'old-id')).toBeUndefined();
  });

  it('should handle storage errors gracefully', () => {
    const mockLocalStorage = {
      getItem: vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      }),
      setItem: vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    const entry = {
      level: 'error' as const,
      apiCall: 'test-api',
      reason: 'Test error',
    };

    // Should not throw
    expect(() => logStorageService.addLog(entry)).not.toThrow();
    expect(() => logStorageService.getLogs()).not.toThrow();
  });
});
```

**File**: `src/contexts/LogContext.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogProvider, useLogContext } from './LogContext';
import { logStorageService } from '../services/logStorageService';

vi.mock('../services/logStorageService');

const TestComponent = () => {
  const { logs, addLog, removeLog } = useLogContext();
  
  return (
    <div>
      <div data-testid="log-count">{logs.length}</div>
      <button onClick={() => addLog({ level: 'error', apiCall: 'test', reason: 'test' })}>
        Add Log
      </button>
      <button onClick={() => removeLog('test-id')}>Remove Log</button>
    </div>
  );
};

describe('LogContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide log context to children', () => {
    render(
      <LogProvider>
        <TestComponent />
      </LogProvider>
    );

    expect(screen.getByTestId('log-count')).toBeInTheDocument();
  });

  it('should load initial logs from storage', () => {
    const mockLogs = [
      { id: '1', timestamp: Date.now(), level: 'error', apiCall: 'test', reason: 'test' },
    ];

    vi.mocked(logStorageService.getLogs).mockReturnValue(mockLogs);

    render(
      <LogProvider>
        <TestComponent />
      </LogProvider>
    );

    expect(screen.getByTestId('log-count')).toHaveTextContent('1');
  });
});
```

### Integration Requirements

#### Update Main App Component

**File**: `src/App.tsx` (update existing)

```typescript
// ... existing imports ...
import { LogProvider } from './contexts/LogContext';

function App() {
  return (
    <ThemeProvider>
      <LogProvider>
        <DashboardContext>
          <TileDataContext>
            <Dashboard />
          </TileDataContext>
        </DashboardContext>
      </LogProvider>
    </ThemeProvider>
  );
}
```

### Non-Functional Requirements

- **Performance**: Log operations should complete within 10ms
- **Storage**: Maximum 1000 log entries to prevent storage bloat
- **Error Handling**: Graceful degradation when localStorage is unavailable
- **Memory**: Efficient cleanup to prevent memory leaks

### Accessibility Considerations

- **Error Handling**: Provide fallback when storage is unavailable
- **User Feedback**: Silent operation to avoid disrupting user experience
- **Data Integrity**: Ensure log data is preserved across sessions

### Risk Assessment

- **Risk**: localStorage quota exceeded
  - **Impact**: Medium
  - **Mitigation**: Implement log rotation and size limits

- **Risk**: Performance impact from frequent log operations
  - **Impact**: Low
  - **Mitigation**: Debounce operations and optimize storage calls

### Success Criteria

- [ ] Log storage service successfully captures API errors and warnings
- [ ] No API errors appear in browser console
- [ ] Automatic cleanup removes logs older than 1 hour
- [ ] Storage operations handle errors gracefully
- [ ] All unit tests pass with >80% coverage
- [ ] Integration with existing app structure works correctly 
