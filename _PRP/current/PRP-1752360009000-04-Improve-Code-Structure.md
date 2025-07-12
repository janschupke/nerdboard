# PRP-1752360009000-04: Improve Code Structure and Organization

## Feature Overview

This PRP focuses on improving the overall code structure and organization of the Nerdboard application. The goal is to create a more maintainable, scalable, and logically organized codebase with proper separation of concerns, consistent patterns, and enhanced TypeScript types.

## User-Facing Description

Developers will benefit from a cleaner, more organized codebase that's easier to navigate, understand, and maintain. The improved structure will make it easier to add new features and fix bugs.

## Functional Requirements

### 1. Consolidate Theme System
- Consolidate theme system between `theme.ts` and `tailwind.config.js`
- Ensure consistent theme usage throughout the application
- Create unified design tokens and variables
- Implement proper theme type definitions

### 2. Improve File Organization
- Reorganize files for better logical structure
- Implement consistent naming conventions
- Create proper directory hierarchy
- Ensure clear separation of concerns

### 3. Enhance TypeScript Types
- Add comprehensive TypeScript interfaces
- Implement proper type safety throughout
- Create reusable type definitions
- Add proper generic types where appropriate

### 4. Improve Component Structure
- Refactor components for better separation of concerns
- Implement consistent component patterns
- Add proper prop validation
- Create reusable component utilities

## Technical Requirements

### File Structure Improvements
```
src/
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TileGrid.tsx
│   │   ├── Tile.tsx
│   │   └── tiles/
│   │       ├── cryptocurrency/
│   │       │   ├── CryptocurrencyTile.tsx
│   │       │   ├── hooks/
│   │       │   │   └── useCryptocurrencyData.ts
│   │       │   ├── services/
│   │       │   │   └── coinGeckoApi.ts
│   │       │   ├── types.ts
│   │       │   └── constants.ts
│   │       └── precious-metals/
│   │           ├── PreciousMetalsTile.tsx
│   │           ├── hooks/
│   │           │   └── usePreciousMetalsData.ts
│   │           ├── services/
│   │           │   └── preciousMetalsApi.ts
│   │           ├── types.ts
│   │           └── constants.ts
│   └── ui/
│       ├── Button.tsx
│       ├── Icon.tsx
│       ├── LoadingSkeleton.tsx
│       ├── PriceDisplay.tsx
│       └── AnimationContainer.tsx
├── contexts/
│   ├── ThemeContext.tsx
│   ├── DashboardContext.tsx
│   └── types.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useDashboard.ts
│   ├── useDragAndDrop.ts
│   ├── useLocalStorage.ts
│   └── useTileResize.ts
├── services/
│   ├── api.ts
│   ├── coinGeckoApi.ts
│   ├── preciousMetalsApi.ts
│   └── types.ts
├── types/
│   ├── index.ts
│   ├── dashboard.ts
│   ├── cryptocurrency.ts
│   ├── preciousMetals.ts
│   ├── animations.ts
│   ├── dragDrop.ts
│   └── errors.ts
├── utils/
│   ├── constants.ts
│   ├── errorHandling.ts
│   └── helpers.ts
├── theme/
│   ├── tokens.ts
│   ├── variables.css
│   └── types.ts
└── constants/
    ├── colors.ts
    ├── dimensions.ts
    ├── messages.ts
    └── breakpoints.ts
```

### Implementation Details

#### 1. Theme System Consolidation
```typescript
// src/theme/tokens.ts
export const THEME_TOKENS = {
  colors: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      900: 'var(--color-primary-900)',
    },
    semantic: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
    },
    background: {
      primary: 'var(--color-background-primary)',
      secondary: 'var(--color-background-secondary)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const;

export type ThemeTokens = typeof THEME_TOKENS;
```

```typescript
// src/theme/types.ts
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  tokens: ThemeTokens;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}
```

#### 2. Enhanced TypeScript Types
```typescript
// src/types/index.ts
export * from './dashboard';
export * from './cryptocurrency';
export * from './preciousMetals';
export * from './animations';
export * from './dragDrop';
export * from './errors';

// Common types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}
```

```typescript
// src/types/dashboard.ts
export interface DashboardTile {
  id: string;
  type: 'cryptocurrency' | 'precious-metals' | 'chart';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  config?: Record<string, any>;
}

export interface DashboardLayout {
  tiles: DashboardTile[];
  isCollapsed: boolean;
  theme: 'light' | 'dark';
}

export interface DashboardContextType {
  layout: DashboardLayout;
  addTile: (tile: DashboardTile) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  toggleCollapse: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

```typescript
// src/types/cryptocurrency.ts
export interface CryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export interface CryptocurrencyApiResponse {
  data: CryptocurrencyData[];
  timestamp: number;
  success: boolean;
}

export interface CryptocurrencyTileProps extends BaseComponentProps {
  data?: CryptocurrencyData[];
  loading?: boolean;
  error?: Error | null;
  refreshInterval?: number;
}
```

#### 3. Improved Component Structure
```typescript
// src/components/dashboard/tiles/cryptocurrency/CryptocurrencyTile.tsx
import React from 'react';
import { CryptocurrencyTileProps } from '../../../../types/cryptocurrency';
import { useCryptocurrencyData } from './hooks/useCryptocurrencyData';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { ErrorBoundary } from '../../ErrorBoundary';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { CRYPTOCURRENCY_CONSTANTS } from './constants';

export const CryptocurrencyTile: React.FC<CryptocurrencyTileProps> = ({
  className,
  refreshInterval = CRYPTOCURRENCY_CONSTANTS.DEFAULT_REFRESH_INTERVAL,
  'data-testid': testId,
}) => {
  const { data, loading, error } = useCryptocurrencyData(refreshInterval);

  if (loading) {
    return <LoadingSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={`cryptocurrency-tile error ${className}`} data-testid={testId}>
        <p>Error loading cryptocurrency data</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`cryptocurrency-tile ${className}`} data-testid={testId}>
        <h3>Cryptocurrency Prices</h3>
        {data?.map((crypto) => (
          <PriceDisplay
            key={crypto.id}
            symbol={crypto.symbol}
            price={crypto.current_price}
            change={crypto.price_change_percentage_24h}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};
```

```typescript
// src/components/dashboard/tiles/cryptocurrency/constants.ts
export const CRYPTOCURRENCY_CONSTANTS = {
  DEFAULT_REFRESH_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 30000,
  API_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

export const CRYPTOCURRENCY_MESSAGES = {
  loading: 'Loading cryptocurrency data...',
  error: 'Failed to load cryptocurrency data',
  noData: 'No cryptocurrency data available',
} as const;
```

#### 4. Enhanced Service Layer
```typescript
// src/services/api.ts
import { ApiResponse, PaginationParams, SortParams } from '../types';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null, loading: false };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request<T>(url.pathname + url.search);
  }
}
```

#### 5. Improved Hook Structure
```typescript
// src/hooks/useDashboard.ts
import { useState, useCallback, useEffect } from 'react';
import { DashboardContextType, DashboardTile } from '../types/dashboard';
import { useLocalStorage } from './useLocalStorage';

const DASHBOARD_STORAGE_KEY = 'nerdboard-dashboard-layout';

export const useDashboard = (): DashboardContextType => {
  const [layout, setLayout] = useLocalStorage<DashboardTile[]>(
    DASHBOARD_STORAGE_KEY,
    []
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const addTile = useCallback((tile: DashboardTile) => {
    setLayout(prev => [...prev, tile]);
  }, [setLayout]);

  const removeTile = useCallback((id: string) => {
    setLayout(prev => prev.filter(tile => tile.id !== id));
  }, [setLayout]);

  const updateTile = useCallback((id: string, updates: Partial<DashboardTile>) => {
    setLayout(prev => prev.map(tile => 
      tile.id === id ? { ...tile, ...updates } : tile
    ));
  }, [setLayout]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setThemeMode = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, []);

  return {
    layout: {
      tiles: layout,
      isCollapsed,
      theme,
    },
    addTile,
    removeTile,
    updateTile,
    toggleCollapse,
    setTheme: setThemeMode,
  };
};
```

#### 6. Enhanced Error Handling
```typescript
// src/utils/errorHandling.ts
import { ErrorType } from '../types/errors';

export class AppError extends Error {
  public type: ErrorType;
  public code?: string;
  public retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = 'unknown',
    code?: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.retryable = retryable;
  }
}

export const createError = (
  message: string,
  type: ErrorType = 'unknown',
  code?: string,
  retryable: boolean = false
): AppError => {
  return new AppError(message, type, code, retryable);
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const handleApiError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createError('Network error', 'network', 'NETWORK_ERROR', true);
  }

  if (error instanceof Error) {
    return createError(error.message, 'unknown', undefined, false);
  }

  return createError('Unknown error occurred', 'unknown', undefined, false);
};
```

## Non-Functional Requirements

### Performance
- Component render times should remain under 100ms
- Bundle size should not increase significantly
- Code splitting should be implemented for better performance
- Lazy loading should be used for non-critical components

### Maintainability
- Code should be well-documented with JSDoc comments
- Consistent patterns should be used throughout
- Clear separation of concerns should be maintained
- Type safety should be enforced throughout

### Scalability
- Structure should support easy addition of new features
- Components should be reusable and composable
- Services should be extensible
- Types should be flexible and extensible

## Testing Requirements

### Unit Tests
- Test all new type definitions
- Verify component prop validation
- Test error handling utilities
- Validate service layer functionality

### Integration Tests
- Test component integration with new structure
- Verify theme system consolidation
- Test service layer integration
- Validate error boundary behavior

### Type Safety Tests
- Ensure all components have proper TypeScript types
- Verify no `any` types are used
- Test generic type implementations
- Validate interface compliance

## Code Examples

### Before (Poor Structure)
```typescript
// src/components/Dashboard.tsx
const Dashboard = () => {
  // Mixed concerns, hardcoded values, poor organization
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="dashboard bg-blue-500">
      {/* Inline styles and hardcoded values */}
    </div>
  );
};
```

### After (Improved Structure)
```typescript
// src/components/dashboard/Dashboard.tsx
import { DashboardContextType } from '../../types/dashboard';
import { THEME_TOKENS } from '../../theme/tokens';
import { DashboardProvider } from '../../contexts/DashboardContext';

interface DashboardProps extends BaseComponentProps {
  initialLayout?: DashboardTile[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  className,
  initialLayout = [],
  'data-testid': testId,
}) => {
  return (
    <DashboardProvider initialLayout={initialLayout}>
      <main 
        className={`dashboard ${className}`}
        data-testid={testId}
        style={{ backgroundColor: THEME_TOKENS.colors.background.primary }}
      >
        <DashboardContent />
      </main>
    </DashboardProvider>
  );
};
```

## Potential Risks

### Technical Risks
1. **Risk**: Refactoring might introduce bugs
   - **Mitigation**: Comprehensive testing before and after changes
   - **Mitigation**: Incremental refactoring with validation

2. **Risk**: Type system changes might break existing code
   - **Mitigation**: Gradual type improvements with backward compatibility
   - **Mitigation**: Thorough type checking and validation

3. **Risk**: Performance impact from structural changes
   - **Mitigation**: Profile performance before and after changes
   - **Mitigation**: Optimize critical paths

### Maintainability Risks
1. **Risk**: New structure might be too complex
   - **Mitigation**: Keep structure simple and logical
   - **Mitigation**: Comprehensive documentation

2. **Risk**: Inconsistent patterns might emerge
   - **Mitigation**: Establish clear coding standards
   - **Mitigation**: Regular code reviews

## Accessibility Considerations

### Code Organization
- Ensure accessibility features are properly organized
- Maintain clear separation of accessibility concerns
- Implement consistent accessibility patterns

### Type Safety
- Ensure accessibility types are properly defined
- Validate accessibility props and attributes
- Test accessibility type compliance

## Success Criteria

### Code Quality
- [ ] All components follow consistent patterns
- [ ] TypeScript types are comprehensive and accurate
- [ ] No hardcoded values in components
- [ ] Proper separation of concerns

### Structure
- [ ] File organization is logical and clear
- [ ] Naming conventions are consistent
- [ ] Directory hierarchy is well-organized
- [ ] Code is easy to navigate and understand

### Maintainability
- [ ] Components are reusable and composable
- [ ] Services are extensible and well-structured
- [ ] Types are flexible and comprehensive
- [ ] Documentation is clear and complete

### Performance
- [ ] No significant performance regression
- [ ] Bundle size remains optimized
- [ ] Component render times are acceptable
- [ ] Code splitting is properly implemented

## Implementation Checklist

- [ ] Consolidate theme system between files
- [ ] Reorganize file structure for better organization
- [ ] Add comprehensive TypeScript types
- [ ] Refactor components for better separation of concerns
- [ ] Implement consistent component patterns
- [ ] Add proper prop validation
- [ ] Create reusable component utilities
- [ ] Enhance service layer structure
- [ ] Improve hook organization
- [ ] Add comprehensive error handling
- [ ] Update all imports and exports
- [ ] Verify TypeScript compilation
- [ ] Run full test suite
- [ ] Check for linting issues
- [ ] Update documentation
- [ ] Verify build process
- [ ] Test performance impact
- [ ] Validate accessibility compliance 
