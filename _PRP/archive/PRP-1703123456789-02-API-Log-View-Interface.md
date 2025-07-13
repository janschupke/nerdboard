# PRP-1703123456789-02-API-Log-View-Interface

## Feature: API Log View Interface

### Overview

Implement the user interface components for the API logging system, including the log button in the top panel and the semi-transparent overlay log view with table display and individual log removal functionality.

### Functional Requirements

- [ ] Create log button component for top panel
- [ ] Implement semi-transparent overlay log view
- [ ] Display logs in table format with color coding
- [ ] Add individual log removal functionality
- [ ] Implement ESC key and X button close functionality
- [ ] Add toggle functionality (button closes view if open)

### Technical Implementation

#### 1. Create Log Button Component

**File**: `src/components/dashboard/LogButton.tsx`

```typescript
import React from 'react';
import { Icon } from '../ui/Icon';
import { useLogContext } from '../../contexts/LogContext';

interface LogButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const LogButton: React.FC<LogButtonProps> = ({ isOpen, onToggle }) => {
  const { logs } = useLogContext();
  const errorCount = logs.filter(log => log.level === 'error').length;
  const warningCount = logs.filter(log => log.level === 'warning').length;

  return (
    <button
      onClick={onToggle}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg
        bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200 focus:outline-none focus:ring-2
        focus:ring-blue-500 dark:focus:ring-blue-400
        ${isOpen ? 'bg-blue-100 dark:bg-blue-900' : ''}
      `}
      aria-label={`API Logs (${errorCount} errors, ${warningCount} warnings)`}
      title={`API Logs - ${errorCount} errors, ${warningCount} warnings`}
    >
      <Icon name="clipboard-list" className="w-4 h-4" />
      <span className="text-sm font-medium">Logs</span>
      
      {(errorCount > 0 || warningCount > 0) && (
        <div className="flex gap-1">
          {errorCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
              {warningCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
```

#### 2. Create Log View Overlay Component

**File**: `src/components/dashboard/LogView.tsx`

```typescript
import React, { useEffect, useCallback } from 'react';
import { Icon } from '../ui/Icon';
import { useLogContext } from '../../contexts/LogContext';
import { APILogEntry } from '../../services/logStorageService';

interface LogViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ isOpen, onClose }) => {
  const { logs, removeLog } = useLogContext();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: 'warning' | 'error'): string => {
    return level === 'error' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getLevelIcon = (level: 'warning' | 'error'): string => {
    return level === 'error' ? 'exclamation-triangle' : 'exclamation-circle';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Log View Container */}
      <div className="relative w-full max-w-6xl mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Icon name="clipboard-list" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              API Logs
            </h2>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                <Icon name="exclamation-triangle" className="w-3 h-3" />
                {logs.filter(log => log.level === 'error').length} Errors
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                <Icon name="exclamation-circle" className="w-3 h-3" />
                {logs.filter(log => log.level === 'warning').length} Warnings
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close log view"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Log Table */}
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Icon name="check-circle" className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No API logs</p>
              <p className="text-sm">All API calls are working correctly</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API Call
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <LogRow 
                    key={log.id} 
                    log={log} 
                    onRemove={() => removeLog(log.id)}
                    formatTimestamp={formatTimestamp}
                    getLevelColor={getLevelColor}
                    getLevelIcon={getLevelIcon}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Logs older than 1 hour are automatically removed
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon name="information-circle" className="w-4 h-4" />
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

interface LogRowProps {
  log: APILogEntry;
  onRemove: () => void;
  formatTimestamp: (timestamp: number) => string;
  getLevelColor: (level: 'warning' | 'error') => string;
  getLevelIcon: (level: 'warning' | 'error') => string;
}

const LogRow: React.FC<LogRowProps> = ({ 
  log, 
  onRemove, 
  formatTimestamp, 
  getLevelColor, 
  getLevelIcon 
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
          <Icon name={getLevelIcon(log.level)} className="w-3 h-3" />
          {log.level}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        {formatTimestamp(log.timestamp)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
        {log.apiCall}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        {log.reason}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Remove log entry for ${log.apiCall}`}
        >
          <Icon name="trash" className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
```

#### 3. Create Log Manager Hook

**File**: `src/hooks/useLogManager.ts`

```typescript
import { useState, useCallback } from 'react';
import { useLogContext } from '../contexts/LogContext';

export const useLogManager = () => {
  const [isLogViewOpen, setIsLogViewOpen] = useState(false);
  const { logs } = useLogContext();

  const toggleLogView = useCallback(() => {
    setIsLogViewOpen(prev => !prev);
  }, []);

  const closeLogView = useCallback(() => {
    setIsLogViewOpen(false);
  }, []);

  const hasLogs = logs.length > 0;
  const errorCount = logs.filter(log => log.level === 'error').length;
  const warningCount = logs.filter(log => log.level === 'warning').length;

  return {
    isLogViewOpen,
    toggleLogView,
    closeLogView,
    hasLogs,
    errorCount,
    warningCount,
  };
};
```

#### 4. Update Dashboard Component

**File**: `src/components/dashboard/Dashboard.tsx` (update existing)

```typescript
// ... existing imports ...
import { LogButton } from './LogButton';
import { LogView } from './LogView';
import { useLogManager } from '../../hooks/useLogManager';

export const Dashboard: React.FC = () => {
  // ... existing code ...
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Panel */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ... existing top panel content ... */}
          </div>
          
          <div className="flex items-center gap-2">
            {/* ... existing buttons ... */}
            <LogButton isOpen={isLogViewOpen} onToggle={toggleLogView} />
          </div>
        </div>
      </div>

      {/* ... existing dashboard content ... */}

      {/* Log View Overlay */}
      <LogView isOpen={isLogViewOpen} onClose={closeLogView} />
    </div>
  );
};
```

### Testing Requirements

#### Unit Tests

**File**: `src/components/dashboard/LogButton.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogButton } from './LogButton';
import { LogProvider } from '../../contexts/LogContext';

const mockOnToggle = vi.fn();

const renderWithProvider = (props: { isOpen: boolean; onToggle: () => void }) => {
  return render(
    <LogProvider>
      <LogButton {...props} />
    </LogProvider>
  );
};

describe('LogButton', () => {
  it('should render log button with correct text', () => {
    renderWithProvider({ isOpen: false, onToggle: mockOnToggle });
    
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show error and warning counts', () => {
    renderWithProvider({ isOpen: false, onToggle: mockOnToggle });
    
    // Mock logs in context would be needed for this test
    // This would require mocking the LogContext
  });

  it('should call onToggle when clicked', () => {
    renderWithProvider({ isOpen: false, onToggle: mockOnToggle });
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should have different styling when open', () => {
    renderWithProvider({ isOpen: true, onToggle: mockOnToggle });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-100');
  });
});
```

**File**: `src/components/dashboard/LogView.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogView } from './LogView';
import { LogProvider } from '../../contexts/LogContext';

const mockOnClose = vi.fn();

const renderWithProvider = (props: { isOpen: boolean; onClose: () => void }) => {
  return render(
    <LogProvider>
      <LogView {...props} />
    </LogProvider>
  );
};

describe('LogView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    renderWithProvider({ isOpen: false, onClose: mockOnClose });
    
    expect(screen.queryByText('API Logs')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    renderWithProvider({ isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('API Logs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close log view/i })).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    renderWithProvider({ isOpen: true, onClose: mockOnClose });
    
    fireEvent.click(screen.getByRole('button', { name: /close log view/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    renderWithProvider({ isOpen: true, onClose: mockOnClose });
    
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show empty state when no logs', () => {
    renderWithProvider({ isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('No API logs')).toBeInTheDocument();
    expect(screen.getByText('All API calls are working correctly')).toBeInTheDocument();
  });
});
```

**File**: `src/hooks/useLogManager.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogManager } from './useLogManager';
import { LogProvider } from '../contexts/LogContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LogProvider>{children}</LogProvider>
);

describe('useLogManager', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useLogManager(), { wrapper });
    
    expect(result.current.isLogViewOpen).toBe(false);
  });

  it('should toggle log view state', () => {
    const { result } = renderHook(() => useLogManager(), { wrapper });
    
    act(() => {
      result.current.toggleLogView();
    });
    
    expect(result.current.isLogViewOpen).toBe(true);
    
    act(() => {
      result.current.toggleLogView();
    });
    
    expect(result.current.isLogViewOpen).toBe(false);
  });

  it('should close log view', () => {
    const { result } = renderHook(() => useLogManager(), { wrapper });
    
    act(() => {
      result.current.toggleLogView();
    });
    
    expect(result.current.isLogViewOpen).toBe(true);
    
    act(() => {
      result.current.closeLogView();
    });
    
    expect(result.current.isLogViewOpen).toBe(false);
  });
});
```

### Integration Requirements

#### Update Icon Component

**File**: `src/components/ui/Icon.tsx` (update existing to add new icons)

```typescript
// Add these new icon names to the existing Icon component:
// - clipboard-list
// - exclamation-triangle
// - exclamation-circle
// - check-circle
// - information-circle
// - trash
// - x
```

### Non-Functional Requirements

- **Performance**: Log view should open/close within 100ms
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Log view should work on all screen sizes
- **Memory**: Proper cleanup of event listeners

### Accessibility Considerations

- **Keyboard Navigation**: ESC key closes the view
- **Focus Management**: Focus trapped within log view when open
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Contrast**: Color coding meets WCAG requirements
- **Semantic HTML**: Proper table structure and button roles

### Risk Assessment

- **Risk**: Log view overlay might interfere with other UI elements
  - **Impact**: Low
  - **Mitigation**: Proper z-index management and backdrop handling

- **Risk**: Performance impact from rendering large log tables
  - **Impact**: Medium
  - **Mitigation**: Virtual scrolling for large datasets

### Success Criteria

- [ ] Log button appears in top panel with correct styling
- [ ] Log view opens as semi-transparent overlay
- [ ] Logs display in table format with color coding
- [ ] Individual log removal works correctly
- [ ] ESC key and X button close functionality works
- [ ] Toggle functionality works (button closes view if open)
- [ ] All unit tests pass with >80% coverage
- [ ] Accessibility requirements are met
- [ ] Responsive design works on all screen sizes 
