# PRP-1703123456789-01-Fix-TileGrid-Re-renders

## Overview

Fix the TileGrid component to prevent unnecessary re-renders by optimizing data hook usage and implementing proper memoization.

## Problem Analysis

The current TileGrid component has a critical performance issue where it calls all data hooks (useCryptocurrencyData, usePreciousMetalsData, etc.) on every render, even when those tile types don't exist in the layout. This causes:

1. Unnecessary API calls for non-existent tiles
2. Excessive re-renders of the entire grid
3. Memory leaks from unused hook subscriptions
4. Poor performance with multiple tiles

## Technical Requirements

### Functional Requirements

- Only call data hooks for tiles that actually exist in the layout
- Implement proper memoization for expensive calculations
- Optimize re-render frequency
- Maintain all existing functionality

### Non-functional Requirements

- Reduce unnecessary re-renders by 80%
- Eliminate memory leaks from unused hooks
- Maintain <100ms render times
- Preserve accessibility features

## Implementation Details

### 1. Optimize TileGrid Component

**File**: `src/components/dashboard/TileGrid.tsx`

**Changes**:
- Remove all data hook calls from the main component
- Create a separate `TileDataProvider` component for data management
- Implement conditional hook usage based on actual tile types
- Add React.memo to prevent unnecessary re-renders

**Code Structure**:
```typescript
// Create TileDataProvider component
const TileDataProvider = React.memo(({ children, tileTypes }: { 
  children: React.ReactNode; 
  tileTypes: Set<TileType> 
}) => {
  // Only call hooks for existing tile types
  const dataHooks = useMemo(() => {
    const hooks: Record<TileType, any> = {};
    
    if (tileTypes.has(TileType.CRYPTOCURRENCY)) {
      hooks[TileType.CRYPTOCURRENCY] = useCryptocurrencyData();
    }
    // ... other conditional hooks
    
    return hooks;
  }, [tileTypes]);

  return (
    <TileDataContext.Provider value={dataHooks}>
      {children}
    </TileDataContext.Provider>
  );
});
```

### 2. Create TileDataContext

**File**: `src/contexts/TileDataContext.tsx`

**Purpose**: Provide optimized data access for tiles

**Implementation**:
```typescript
interface TileDataContextType {
  getTileData: (tileType: TileType) => {
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    isCached: boolean;
  };
}

export const TileDataContext = createContext<TileDataContextType | null>(null);
```

### 3. Optimize Individual Tiles

**Files**: All tile components in `src/components/dashboard/tiles/`

**Changes**:
- Add React.memo to all tile components
- Implement proper useMemo for expensive calculations
- Optimize prop passing to prevent object recreation

### 4. Fix Hook Dependencies

**Files**: All hook files in `src/hooks/` and `src/components/dashboard/tiles/*/hooks/`

**Changes**:
- Fix useCallback dependency arrays
- Add useMemo for expensive calculations
- Ensure proper cleanup of intervals and event listeners

## Code Examples

### Before (Problematic):
```typescript
export function TileGrid() {
  // All hooks called regardless of tile existence
  const cryptocurrencyData = useCryptocurrencyData();
  const preciousMetalsData = usePreciousMetalsData();
  // ... more hooks
  
  const getTileData = (tileType: TileType) => {
    // Object recreation on every render
    switch (tileType) {
      case TileType.CRYPTOCURRENCY:
        return {
          loading: cryptocurrencyData.loading,
          error: cryptocurrencyData.error,
          // ...
        };
    }
  };
}
```

### After (Optimized):
```typescript
const TileGrid = React.memo(() => {
  const { layout } = useContext(DashboardContext);
  const tileTypes = useMemo(() => 
    new Set(layout.tiles.map(tile => tile.type)), 
    [layout.tiles]
  );

  return (
    <TileDataProvider tileTypes={tileTypes}>
      <TileGridContent />
    </TileDataProvider>
  );
});

const TileGridContent = React.memo(() => {
  const { layout } = useContext(DashboardContext);
  const tileData = useContext(TileDataContext);
  
  const getTileData = useCallback((tileType: TileType) => {
    return tileData?.getTileData(tileType) || {
      loading: false,
      error: null,
      lastUpdated: null,
      isCached: false,
    };
  }, [tileData]);

  // Memoized tile rendering
  const renderedTiles = useMemo(() => 
    layout.tiles.map(tile => (
      <Tile
        key={tile.id}
        tile={tile}
        tileData={getTileData(tile.type)}
      />
    )), 
    [layout.tiles, getTileData]
  );

  return <div>{renderedTiles}</div>;
});
```

## Testing Requirements

### Unit Tests
- Test that hooks are only called for existing tile types
- Verify memoization prevents unnecessary re-renders
- Test context value updates properly
- Ensure cleanup functions are called

### Integration Tests
- Test dashboard performance with multiple tiles
- Verify no memory leaks occur
- Test data updates trigger appropriate re-renders only

### Performance Tests
- Measure render times before and after changes
- Verify bundle size impact
- Test memory usage patterns

## Risks and Mitigation

### Risks
1. **Breaking existing functionality**: Changes to data flow could break tile rendering
2. **Context complexity**: Adding new context could complicate the codebase
3. **Performance regression**: Over-optimization could cause issues

### Mitigation
1. **Comprehensive testing**: Test all tile types and scenarios
2. **Gradual migration**: Implement changes incrementally
3. **Performance monitoring**: Measure impact of each change
4. **Fallback mechanisms**: Provide fallbacks for edge cases

## Success Criteria

- [ ] TileGrid only calls hooks for existing tiles
- [ ] Re-renders reduced by 80% in performance tests
- [ ] No memory leaks detected
- [ ] All existing functionality preserved
- [ ] Bundle size remains stable or improves
- [ ] All tests pass
- [ ] No console warnings about missing dependencies

## Dependencies

- React.memo for component memoization
- useMemo for expensive calculations
- useCallback for stable function references
- Context API for optimized data sharing

## Files to Modify

1. `src/components/dashboard/TileGrid.tsx` - Main optimization
2. `src/contexts/TileDataContext.tsx` - New context (create)
3. `src/components/dashboard/tiles/*/index.tsx` - Add React.memo
4. `src/hooks/useCryptocurrencyData.ts` - Fix dependencies
5. `src/hooks/usePreciousMetalsData.ts` - Fix dependencies
6. All tile hook files - Fix dependencies and cleanup

## Implementation Order

1. Create TileDataContext
2. Optimize TileGrid component
3. Fix hook dependencies
4. Add React.memo to tile components
5. Test and validate changes
6. Performance testing and optimization 
