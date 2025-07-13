# PRP-1703123456789-03: Sidebar Keyboard Navigation

## Feature Overview

Implement comprehensive keyboard navigation for the sidebar, including arrow key navigation through sidebar items, Enter key to toggle tiles, and left/right arrow keys to collapse/expand the sidebar.

## User-Facing Description

Users can navigate the sidebar entirely with their keyboard. Up and down arrow keys move through the sidebar items, with the currently selected item visually highlighted. Pressing Enter toggles the selected tile (adds it if inactive, removes it if active). Left and right arrow keys collapse and expand the sidebar respectively. All keyboard interactions provide immediate visual feedback and are fully accessible to screen readers.

## Functional Requirements

### Core Functionality

1. **Arrow Key Navigation**
   - Up arrow key moves to previous sidebar item
   - Down arrow key moves to next sidebar item
   - Navigation wraps around at top and bottom of list
   - Currently selected item is visually highlighted
   - Smooth visual transitions between selections

2. **Enter Key Toggle**
   - Enter key toggles the currently selected sidebar item
   - Adds tile if currently inactive
   - Removes tile if currently active
   - Immediate visual feedback for toggle action

3. **Sidebar Collapse/Expand**
   - Left arrow key collapses sidebar when expanded
   - Right arrow key expands sidebar when collapsed
   - Smooth animation for collapse/expand transitions
   - State persists in local storage

4. **Visual State Management**
   - Three distinct visual states: inactive, active, selected
   - Selected state clearly different from active state
   - Smooth transitions between all states
   - Consistent visual hierarchy

### Technical Requirements

1. **Keyboard Event Handling**
   - Proper event capture and prevention
   - No conflicts with existing keyboard shortcuts
   - Efficient event handling for rapid key presses
   - Proper focus management

2. **State Management**
   - Track currently selected sidebar item
   - Synchronize with existing active tiles state
   - Handle sidebar collapse/expand state
   - Persist keyboard navigation preferences

3. **Accessibility Compliance**
   - Full WCAG 2.1 AA compliance
   - Screen reader announcements
   - Proper ARIA attributes
   - Logical tab order maintenance

## Technical Implementation

### Keyboard Navigation Hook

```typescript
// Custom hook for keyboard navigation
export const useKeyboardNavigation = (
  items: string[],
  onToggle: (itemId: string) => void,
  onSidebarToggle: () => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev === 0 ? items.length - 1 : prev - 1
        );
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev === items.length - 1 ? 0 : prev + 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (items[selectedIndex]) {
          onToggle(items[selectedIndex]);
        }
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        if (!isSidebarCollapsed) {
          setIsSidebarCollapsed(true);
          onSidebarToggle();
        }
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          onSidebarToggle();
        }
        break;
    }
  }, [items, selectedIndex, isSidebarCollapsed, onToggle, onSidebarToggle]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    selectedIndex,
    setSelectedIndex,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  };
};
```

### Enhanced Sidebar Component

```typescript
// Enhanced Sidebar with keyboard navigation
export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { activeTiles, toggleTile } = useDashboard();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  
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

  const itemIds = useMemo(() => sidebarItems.map(item => item.id), [sidebarItems]);

  const handleTileToggle = useCallback(async (tileId: string) => {
    try {
      await toggleTile(tileId);
    } catch (error) {
      console.error('Failed to toggle tile:', error);
    }
  }, [toggleTile]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
    onToggle();
  }, [onToggle]);

  const { selectedIndex, setSelectedIndex } = useKeyboardNavigation(
    itemIds,
    handleTileToggle,
    handleSidebarToggle
  );

  // Announce selection changes to screen readers
  useEffect(() => {
    const selectedItem = sidebarItems[selectedIndex];
    if (selectedItem) {
      const announcement = `Selected ${selectedItem.label} tile`;
      // Use live region for screen reader announcement
      const liveRegion = document.getElementById('keyboard-announcements');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [selectedIndex, sidebarItems]);

  return (
    <>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Available Tiles ({sidebarItems.length})</h2>
          <button 
            onClick={handleSidebarToggle} 
            className="sidebar-toggle"
            aria-label={`${isSidebarCollapsed ? 'Expand' : 'Collapse'} sidebar`}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav" role="navigation" aria-label="Available tiles">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeTiles.includes(item.id)}
              isSelected={index === selectedIndex}
              onClick={() => handleTileToggle(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleTileToggle(item.id);
                }
              }}
            />
          ))}
        </nav>
      </aside>
      
      {/* Live region for screen reader announcements */}
      <div 
        id="keyboard-announcements" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
    </>
  );
};
```

### Enhanced SidebarItem Component

```typescript
// Enhanced SidebarItem with keyboard navigation support
export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  isSelected = false,
  onClick,
  onKeyDown,
}) => {
  const getStateClasses = () => {
    if (isSelected) {
      return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 ring-2 ring-yellow-300';
    }
    if (isActive) {
      return 'bg-blue-50 border-l-4 border-blue-500 text-blue-700';
    }
    return 'bg-gray-50 hover:bg-gray-100 text-gray-700';
  };

  const getAriaLabel = () => {
    const state = isActive ? 'active' : 'inactive';
    const selection = isSelected ? ' - selected' : '';
    return `${item.label} tile - ${state}${selection}`;
  };

  return (
    <button
      className={`
        sidebar-item 
        transition-all duration-200 
        ${getStateClasses()}
        ${isSelected ? 'focus:ring-2 focus:ring-yellow-300' : 'focus:ring-2 focus:ring-blue-300'}
      `}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={getAriaLabel()}
      aria-pressed={isActive}
      aria-selected={isSelected}
      role="option"
      tabIndex={isSelected ? 0 : -1}
    >
      <span className="sidebar-item-icon">{item.icon}</span>
      <span className="sidebar-item-label">{item.label}</span>
      {isActive && (
        <span className="sidebar-item-indicator" aria-hidden="true">
          ✓
        </span>
      )}
      {isSelected && (
        <span className="sidebar-item-selection" aria-hidden="true">
          ▶
        </span>
      )}
    </button>
  );
};
```

### Sidebar State Persistence

```typescript
// Hook for sidebar state persistence
export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, []);

  return {
    isCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  };
};
```

### Keyboard Shortcuts Help Component

```typescript
// Component to display keyboard shortcuts help
export const KeyboardShortcutsHelp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="keyboard-shortcuts-help">
      <div className="help-content">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>↑</kbd> <kbd>↓</kbd> Navigate sidebar items</li>
          <li><kbd>Enter</kbd> Toggle selected tile</li>
          <li><kbd>←</kbd> <kbd>→</kbd> Collapse/expand sidebar</li>
          <li><kbd>Ctrl/Cmd</kbd> + <kbd>?</kbd> Show/hide this help</li>
        </ul>
        <button onClick={() => setIsVisible(false)}>Close</button>
      </div>
    </div>
  );
};
```

## Testing Requirements

### Unit Tests

1. **Keyboard Navigation Hook Tests**
   - Test arrow key navigation
   - Test Enter key functionality
   - Test sidebar collapse/expand
   - Test wrapping behavior

2. **Sidebar Component Tests**
   - Test keyboard event handling
   - Test visual state management
   - Test screen reader announcements
   - Test state persistence

3. **SidebarItem Component Tests**
   - Test visual states (inactive, active, selected)
   - Test keyboard interaction
   - Test accessibility attributes
   - Test focus management

### Integration Tests

1. **Keyboard Navigation Integration**
   - Test complete keyboard workflow
   - Test state synchronization
   - Test accessibility compliance
   - Test performance under rapid key presses

2. **Screen Reader Tests**
   - Test announcements for selection changes
   - Test announcements for tile toggles
   - Test announcements for sidebar state changes
   - Test proper ARIA attributes

### Test Coverage Requirements

- **Keyboard Navigation**: >95% for keyboard event handling
- **Visual States**: >90% for state management
- **Accessibility**: >95% for ARIA and screen reader support
- **Integration**: >85% for complete keyboard workflow

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All functionality accessible via keyboard
   - Logical tab order maintained
   - No keyboard traps
   - Clear focus indicators

2. **Screen Reader Support**
   - Proper ARIA labels and roles
   - Live region announcements
   - State change announcements
   - Contextual information provided

3. **Visual Accessibility**
   - Sufficient color contrast for all states
   - Alternative visual indicators
   - High contrast mode support
   - Reduced motion support

### Screen Reader Announcements

```typescript
// Utility for screen reader announcements
export const announceToScreenReader = (message: string) => {
  const liveRegion = document.getElementById('keyboard-announcements');
  if (liveRegion) {
    liveRegion.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
};

// Usage examples
announceToScreenReader('Selected Cryptocurrency tile');
announceToScreenReader('Added Cryptocurrency tile to dashboard');
announceToScreenReader('Removed Cryptocurrency tile from dashboard');
announceToScreenReader('Sidebar collapsed');
announceToScreenReader('Sidebar expanded');
```

## Performance Requirements

### Performance Benchmarks

- **Key Response**: < 25ms for key press handling
- **Visual Update**: < 50ms for visual state changes
- **State Sync**: < 100ms for state synchronization
- **Animation**: < 300ms for sidebar collapse/expand

### Optimization Strategies

- **Event Debouncing**: Prevent rapid successive key presses
- **Memoization**: Optimize component re-renders
- **Efficient State Updates**: Minimize unnecessary re-renders
- **Lazy Loading**: Defer non-critical operations

## Error Handling

### Error Scenarios

1. **Keyboard Event Conflicts**
   - Prevent conflicts with existing shortcuts
   - Graceful fallback for unsupported keys
   - Clear error messaging

2. **State Synchronization Issues**
   - Prevent inconsistent visual states
   - Automatic state recovery
   - Clear error indicators

3. **Accessibility Issues**
   - Fallback for screen reader issues
   - Alternative interaction methods
   - Clear error announcements

### Error Recovery

```typescript
// Error boundary for keyboard navigation
export const KeyboardNavigationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="keyboard-error">
        <p>Keyboard navigation is temporarily unavailable. Please use mouse navigation.</p>
        <button onClick={() => setHasError(false)}>
          Retry Keyboard Navigation
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      {children}
    </ErrorBoundary>
  );
};
```

## Success Criteria

### Functional Success

- [ ] Arrow keys navigate through sidebar items
- [ ] Enter key toggles selected items
- [ ] Left/right arrows collapse/expand sidebar
- [ ] Navigation wraps around at list boundaries
- [ ] Three visual states are clearly distinguished

### Technical Success

- [ ] Key response time < 25ms
- [ ] Visual update time < 50ms
- [ ] Test coverage > 95% for keyboard navigation
- [ ] No console errors during keyboard interaction
- [ ] Full WCAG 2.1 AA compliance

### User Experience Success

- [ ] Users can navigate entirely with keyboard
- [ ] Visual feedback is immediate and clear
- [ ] Screen reader support is comprehensive
- [ ] No confusion about keyboard shortcuts

## Risk Mitigation

### Technical Risks

1. **Keyboard Event Conflicts**
   - Implement proper event handling
   - Prevent default browser behavior where needed
   - Test with existing keyboard shortcuts

2. **Performance Issues**
   - Optimize event handling
   - Implement debouncing
   - Monitor keyboard interaction performance

3. **Accessibility Compliance**
   - Comprehensive screen reader testing
   - Proper ARIA implementation
   - Keyboard navigation testing

### User Experience Risks

1. **Keyboard Shortcut Confusion**
   - Provide clear documentation
   - Implement help system
   - Use intuitive key combinations

2. **Visual State Confusion**
   - Clear visual distinction between states
   - Consistent visual patterns
   - Proper accessibility indicators

## Implementation Checklist

### Phase 1: Basic Keyboard Navigation
- [ ] Implement arrow key navigation
- [ ] Add Enter key toggle functionality
- [ ] Create visual selection indicator
- [ ] Add basic accessibility support

### Phase 2: Sidebar Collapse/Expand
- [ ] Implement left/right arrow functionality
- [ ] Add smooth collapse/expand animations
- [ ] Implement state persistence
- [ ] Test with existing sidebar functionality

### Phase 3: Accessibility Enhancement
- [ ] Add comprehensive screen reader support
- [ ] Implement proper ARIA attributes
- [ ] Add live region announcements
- [ ] Test with screen readers

### Phase 4: Polish and Testing
- [ ] Add keyboard shortcuts help
- [ ] Implement error boundaries
- [ ] Add comprehensive tests
- [ ] Optimize performance

## Dependencies

### Internal Dependencies
- PRP-1703123456789-01 (Sidebar Visual State Management)
- PRP-1703123456789-02 (Sidebar Interactive Functionality)
- Existing sidebar components
- Dashboard context

### External Dependencies
- React 19
- TypeScript
- Tailwind CSS

## Timeline

- **Phase 1**: 3-4 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 2-3 hours
- **Phase 4**: 1-2 hours

**Total Estimated Time**: 8-12 hours 
