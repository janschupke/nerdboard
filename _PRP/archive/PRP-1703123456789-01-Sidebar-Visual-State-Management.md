# PRP-1703123456789-01: Sidebar Visual State Management

## Feature Overview

Implement visual state management for the sidebar to reflect which tiles are currently active on the dashboard, with distinct styling for active vs inactive sidebar items.

## User-Facing Description

Users will see clear visual feedback in the sidebar indicating which tiles are currently displayed on their dashboard. Active tiles in the sidebar will have distinct styling (different background color, border, or icon state) to make it immediately obvious which tiles are currently visible. This provides instant visual confirmation of the current dashboard configuration.

## Functional Requirements

### Core Functionality

1. **Visual Indicators for Active Tiles**
   - Active tiles on the dashboard must be visually indicated in the sidebar
   - Use distinct styling (background color, border, or icon state)
   - Styling should be clearly different from inactive items
   - Visual changes should be immediate and smooth

2. **State Synchronization**
   - Sidebar state must always reflect the current dashboard configuration
   - Changes to dashboard tiles must immediately update sidebar visual state
   - Bidirectional synchronization between dashboard and sidebar

3. **Visual State Transitions**
   - Smooth transitions when tile states change
   - No jarring or abrupt visual changes
   - Consistent animation timing across all state changes

### Technical Requirements

1. **Component Integration**
   - Integrate with existing `Sidebar.tsx` component
   - Connect with `Dashboard.tsx` state management
   - Use existing tile type definitions and constants

2. **State Management**
   - Extend existing dashboard state to track active tiles
   - Implement state synchronization logic
   - Ensure single source of truth for tile state

3. **Styling Implementation**
   - Use Tailwind CSS classes for visual indicators
   - Follow existing design system patterns
   - Ensure accessibility compliance (WCAG 2.1 AA)

## Technical Implementation

### Component Structure

```typescript
// Enhanced Sidebar component with visual state management
interface SidebarProps {
  activeTiles: string[];
  onTileToggle: (tileId: string) => void;
  onSidebarToggle: () => void;
}

// Sidebar item component with visual states
interface SidebarItemProps {
  tileId: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}
```

### State Management

```typescript
// Enhanced dashboard context
interface DashboardContextType {
  activeTiles: string[];
  setActiveTiles: (tiles: string[]) => void;
  toggleTile: (tileId: string) => void;
  isTileActive: (tileId: string) => boolean;
}
```

### Visual State Classes

```typescript
// Tailwind classes for different visual states
const SIDEBAR_ITEM_STATES = {
  inactive: 'bg-gray-50 hover:bg-gray-100 text-gray-700',
  active: 'bg-blue-50 border-l-4 border-blue-500 text-blue-700',
  selected: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700',
} as const;
```

### Implementation Steps

1. **Update Sidebar Component**
   - Add visual state props and logic
   - Implement conditional styling based on active state
   - Add smooth transition classes

2. **Enhance Dashboard Context**
   - Add active tiles tracking
   - Implement state synchronization methods
   - Add tile toggle functionality

3. **Update Tile Components**
   - Ensure tile removal updates sidebar state
   - Add proper event handling for X button clicks
   - Implement bidirectional state sync

4. **Add Visual Transitions**
   - Implement CSS transitions for state changes
   - Add loading states for smooth UX
   - Ensure consistent animation timing

## Testing Requirements

### Unit Tests

1. **Sidebar Component Tests**
   - Test visual state rendering for active/inactive items
   - Test state synchronization with dashboard
   - Test transition animations

2. **Dashboard Context Tests**
   - Test active tiles state management
   - Test tile toggle functionality
   - Test state synchronization

3. **Integration Tests**
   - Test sidebar-dashboard state synchronization
   - Test visual feedback for tile additions/removals
   - Test smooth transitions

### Test Coverage Requirements

- **Component Coverage**: >90% for Sidebar component
- **State Management**: >95% for dashboard context
- **Integration**: >85% for sidebar-dashboard integration

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Visual Indicators**
   - Ensure sufficient color contrast for all visual states
   - Provide alternative visual indicators (borders, icons)
   - Support high contrast mode

2. **Screen Reader Support**
   - Proper ARIA labels for active/inactive states
   - Announce state changes to screen readers
   - Clear semantic structure

3. **Keyboard Navigation**
   - All visual states accessible via keyboard
   - Clear focus indicators for all states
   - Logical tab order maintained

## Performance Requirements

### Performance Benchmarks

- **Render Time**: Sidebar updates within 100ms
- **State Sync**: State synchronization within 50ms
- **Animation**: Transitions complete within 300ms
- **Memory**: No memory leaks from state management

### Optimization Strategies

- **React.memo**: Memoize sidebar items for performance
- **useMemo**: Optimize state calculations
- **useCallback**: Optimize event handlers
- **Debouncing**: Prevent excessive re-renders

## Error Handling

### Error Scenarios

1. **State Sync Failures**
   - Graceful fallback to default state
   - User-friendly error messages
   - Automatic retry mechanism

2. **Visual State Conflicts**
   - Prevent inconsistent visual states
   - Fallback to safe default styling
   - Log errors for debugging

3. **Performance Issues**
   - Throttle rapid state changes
   - Implement loading states
   - Graceful degradation

## Code Examples

### Enhanced Sidebar Component

```typescript
// src/components/dashboard/Sidebar.tsx
import React, { useMemo } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { activeTiles, toggleTile } = useDashboard();
  
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

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Available Tiles ({sidebarItems.length})</h2>
        <button onClick={onToggle} className="sidebar-toggle">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeTiles.includes(item.id)}
            onClick={() => toggleTile(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};
```

### Sidebar Item Component

```typescript
// src/components/dashboard/SidebarItem.tsx
import React from 'react';

interface SidebarItemProps {
  item: {
    id: string;
    label: string;
    icon: string;
  };
  isActive: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  isSelected = false,
  onClick,
}) => {
  const getStateClasses = () => {
    if (isSelected) {
      return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700';
    }
    if (isActive) {
      return 'bg-blue-50 border-l-4 border-blue-500 text-blue-700';
    }
    return 'bg-gray-50 hover:bg-gray-100 text-gray-700';
  };

  return (
    <button
      className={`sidebar-item transition-all duration-200 ${getStateClasses()}`}
      onClick={onClick}
      aria-label={`${item.label} tile - ${isActive ? 'active' : 'inactive'}`}
      aria-pressed={isActive}
    >
      <span className="sidebar-item-icon">{item.icon}</span>
      <span className="sidebar-item-label">{item.label}</span>
      {isActive && (
        <span className="sidebar-item-indicator" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
};
```

### Enhanced Dashboard Context

```typescript
// src/contexts/DashboardContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface DashboardContextType {
  activeTiles: string[];
  setActiveTiles: (tiles: string[]) => void;
  toggleTile: (tileId: string) => void;
  isTileActive: (tileId: string) => boolean;
  addTile: (tileId: string) => void;
  removeTile: (tileId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTiles, setActiveTiles] = useState<string[]>([]);

  const toggleTile = useCallback((tileId: string) => {
    setActiveTiles(prev => {
      if (prev.includes(tileId)) {
        return prev.filter(id => id !== tileId);
      } else {
        return [...prev, tileId];
      }
    });
  }, []);

  const isTileActive = useCallback((tileId: string) => {
    return activeTiles.includes(tileId);
  }, [activeTiles]);

  const addTile = useCallback((tileId: string) => {
    if (!activeTiles.includes(tileId)) {
      setActiveTiles(prev => [...prev, tileId]);
    }
  }, [activeTiles]);

  const removeTile = useCallback((tileId: string) => {
    setActiveTiles(prev => prev.filter(id => id !== tileId));
  }, []);

  const value: DashboardContextType = {
    activeTiles,
    setActiveTiles,
    toggleTile,
    isTileActive,
    addTile,
    removeTile,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
```

## Success Criteria

### Functional Success

- [ ] Active tiles are visually indicated in sidebar with distinct styling
- [ ] State synchronization works bidirectionally between dashboard and sidebar
- [ ] Visual transitions are smooth and immediate
- [ ] All tile types display correct visual states

### Technical Success

- [ ] Component render time < 100ms
- [ ] State synchronization < 50ms
- [ ] Test coverage > 90% for sidebar components
- [ ] No console errors or warnings
- [ ] Accessibility compliance (WCAG 2.1 AA)

### User Experience Success

- [ ] Users can immediately identify active tiles in sidebar
- [ ] Visual feedback is clear and intuitive
- [ ] No confusion about tile states
- [ ] Smooth, professional appearance

## Risk Mitigation

### Technical Risks

1. **State Synchronization Conflicts**
   - Implement single source of truth for tile state
   - Use proper React patterns for state management
   - Add comprehensive error handling

2. **Performance Issues**
   - Implement React.memo for sidebar items
   - Use useMemo and useCallback for optimizations
   - Monitor render performance

3. **Visual State Inconsistencies**
   - Implement comprehensive testing
   - Add visual regression tests
   - Use TypeScript for type safety

### User Experience Risks

1. **Visual Confusion**
   - Use distinct, accessible visual indicators
   - Provide clear documentation
   - Test with users for clarity

2. **Performance Impact**
   - Optimize for smooth animations
   - Implement loading states
   - Monitor user feedback

## Implementation Checklist

### Phase 1: Foundation
- [ ] Update DashboardContext with active tiles state
- [ ] Enhance Sidebar component with visual state props
- [ ] Create SidebarItem component with state styling
- [ ] Implement basic state synchronization

### Phase 2: Visual Enhancement
- [ ] Add smooth transition animations
- [ ] Implement proper visual state classes
- [ ] Add accessibility attributes
- [ ] Test visual states across all tile types

### Phase 3: Integration
- [ ] Connect with existing tile components
- [ ] Implement bidirectional state sync
- [ ] Add comprehensive error handling
- [ ] Test integration thoroughly

### Phase 4: Polish
- [ ] Optimize performance
- [ ] Add comprehensive tests
- [ ] Ensure accessibility compliance
- [ ] Document implementation

## Dependencies

### Internal Dependencies
- Existing `Sidebar.tsx` component
- Existing `Dashboard.tsx` component
- Existing tile components
- Tailwind CSS configuration

### External Dependencies
- React 19
- TypeScript
- Tailwind CSS

## Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 1-2 hours
- **Phase 3**: 2-3 hours
- **Phase 4**: 1-2 hours

**Total Estimated Time**: 6-10 hours 
