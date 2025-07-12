# PRP-1752360009000-03: Fix Testing Infrastructure Issues

## Feature Overview

This PRP addresses critical testing infrastructure issues including failing tests, inadequate test coverage, and improper API mocking. The goal is to establish a robust, reliable testing foundation that ensures code quality and prevents regressions.

## User-Facing Description

Developers will have a reliable test suite that runs consistently and provides confidence in code changes. The testing experience will be faster, more predictable, and comprehensive.

## Functional Requirements

### 1. Fix Failing Tests
- Resolve failing tests in Dashboard.test.tsx, Sidebar.test.tsx, Tile.test.tsx
- Identify and fix root causes of test failures
- Ensure all tests pass consistently
- Implement proper test isolation

### 2. Replace Real API Calls
- Replace all real API calls in tests with mocked endpoints
- Implement comprehensive API mocking strategy
- Ensure tests don't depend on external services
- Create reliable test data factories

### 3. Improve Test Coverage
- Achieve >80% test coverage requirement
- Add missing tests for critical components
- Implement comprehensive unit tests
- Add integration tests for data flow

### 4. Enhance Test Infrastructure
- Improve test setup and teardown procedures
- Implement proper test utilities and helpers
- Add comprehensive error testing
- Create reusable test patterns

## Technical Requirements

### File Structure Changes
```
src/
├── test/
│   ├── setup/
│   │   ├── testSetup.ts          # Global test setup
│   │   ├── mockSetup.ts          # Mock configuration
│   │   └── testUtils.ts          # Test utilities
│   ├── mocks/
│   │   ├── apiMockService.ts     # API mocking service
│   │   └── factories/            # Mock data factories
│   └── __mocks__/                # Jest mock files
```

### Implementation Details

#### 1. Global Test Setup
```typescript
// src/test/setup/testSetup.ts
import '@testing-library/jest-dom';
import { setupMockApiService } from './mockSetup';

beforeAll(() => {
  // Setup global mocks
  setupMockApiService();
  
  // Mock fetch globally
  global.fetch = jest.fn();
  
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
```

#### 2. Test Utilities
```typescript
// src/test/setup/testUtils.ts
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DashboardProvider } from '../../contexts/DashboardContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
  dashboardState?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { theme = 'light', dashboardState = {}, ...renderOptions } = options;

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider initialTheme={theme}>
      <DashboardProvider initialState={dashboardState}>
        {children}
      </DashboardProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

export function createMockDashboardState(overrides = {}) {
  return {
    tiles: [],
    layout: [],
    isCollapsed: false,
    ...overrides,
  };
}

export function waitForLoadingToFinish() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

#### 3. Fix Dashboard Component Tests
```typescript
// src/components/dashboard/Dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/setup/testUtils';
import { Dashboard } from './Dashboard';
import { MockApiService } from '../../test/mocks/apiMockService';

describe('Dashboard Component', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('renders dashboard with sidebar', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('toggles sidebar collapse state', async () => {
    renderWithProviders(<Dashboard />);
    
    const toggleButton = screen.getByLabelText(/toggle sidebar/i);
    const sidebar = screen.getByRole('complementary');
    
    expect(sidebar).not.toHaveClass('collapsed');
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(sidebar).toHaveClass('collapsed');
    });
  });

  it('displays loading state when data is loading', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      delay: 100,
    });

    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'network',
    });

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### 4. Fix Sidebar Component Tests
```typescript
// src/components/dashboard/Sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/setup/testUtils';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  const defaultProps = {
    isCollapsed: false,
    onToggle: jest.fn(),
  };

  it('renders sidebar with correct content', () => {
    renderWithProviders(<Sidebar {...defaultProps} />);
    
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('applies collapsed class when isCollapsed is true', () => {
    renderWithProviders(<Sidebar {...defaultProps} isCollapsed={true} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('collapsed');
  });

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = jest.fn();
    renderWithProviders(<Sidebar {...defaultProps} onToggle={onToggle} />);
    
    const toggleButton = screen.getByLabelText(/toggle sidebar/i);
    fireEvent.click(toggleButton);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible', () => {
    renderWithProviders(<Sidebar {...defaultProps} />);
    
    const toggleButton = screen.getByLabelText(/toggle sidebar/i);
    expect(toggleButton).toHaveAttribute('tabindex', '0');
    
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    expect(defaultProps.onToggle).toHaveBeenCalled();
  });
});
```

#### 5. Fix Tile Component Tests
```typescript
// src/components/dashboard/Tile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/setup/testUtils';
import { Tile } from './Tile';

describe('Tile Component', () => {
  const defaultProps = {
    id: 'test-tile',
    title: 'Test Tile',
    children: <div>Test content</div>,
    onResize: jest.fn(),
    onMove: jest.fn(),
  };

  it('renders tile with correct content', () => {
    renderWithProviders(<Tile {...defaultProps} />);
    
    expect(screen.getByText('Test Tile')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithProviders(<Tile {...defaultProps} />);
    
    const tile = screen.getByRole('article');
    expect(tile).toHaveClass('tile');
    expect(tile).toHaveAttribute('data-tile-id', 'test-tile');
  });

  it('handles resize events', () => {
    const onResize = jest.fn();
    renderWithProviders(<Tile {...defaultProps} onResize={onResize} />);
    
    const tile = screen.getByRole('article');
    fireEvent.mouseDown(tile);
    fireEvent.mouseMove(tile);
    fireEvent.mouseUp(tile);
    
    expect(onResize).toHaveBeenCalled();
  });

  it('is keyboard accessible', () => {
    renderWithProviders(<Tile {...defaultProps} />);
    
    const tile = screen.getByRole('article');
    expect(tile).toHaveAttribute('tabindex', '0');
    
    fireEvent.keyDown(tile, { key: 'Enter' });
    // Verify appropriate behavior
  });
});
```

#### 6. API Service Tests with Mocking
```typescript
// src/services/coinGeckoApi.test.ts
import { MockApiService } from '../test/mocks/apiMockService';
import { createCryptocurrencyMockData } from '../test/mocks/factories/cryptocurrencyFactory';
import { fetchCryptocurrencyData } from './coinGeckoApi';

describe('CoinGecko API Service', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('fetches cryptocurrency data successfully', async () => {
    const mockData = createCryptocurrencyMockData();
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: mockData,
    });

    const result = await fetchCryptocurrencyData();
    
    expect(result).toEqual(mockData);
    expect(result.current_price).toBe(45000);
  });

  it('handles network errors gracefully', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'network',
    });

    await expect(fetchCryptocurrencyData()).rejects.toThrow('Network error');
  });

  it('handles timeout errors', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'timeout',
    });

    await expect(fetchCryptocurrencyData()).rejects.toThrow('Request timeout');
  });

  it('handles malformed JSON responses', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'malformed',
    });

    await expect(fetchCryptocurrencyData()).rejects.toThrow('Invalid JSON response');
  });
});
```

#### 7. Hook Tests with Mocking
```typescript
// src/hooks/useCryptocurrencyData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { MockApiService } from '../test/mocks/apiMockService';
import { createCryptocurrencyListMockData } from '../test/mocks/factories/cryptocurrencyFactory';
import { useCryptocurrencyData } from './useCryptocurrencyData';

describe('useCryptocurrencyData Hook', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('loads cryptocurrency data successfully', async () => {
    const mockData = createCryptocurrencyListMockData(5);
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: mockData,
      delay: 100,
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles loading states correctly', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      delay: 200,
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles error states correctly', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'network',
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Network error');
  });

  it('refreshes data on interval', async () => {
    const mockData = createCryptocurrencyListMockData();
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: mockData,
      delay: 50,
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialData = result.current.data;

    // Wait for refresh interval
    await waitFor(() => {
      expect(result.current.data).not.toEqual(initialData);
    }, { timeout: 5000 });
  });
});
```

## Non-Functional Requirements

### Performance
- Test execution time should be under 30 seconds for full suite
- Individual test execution should be under 100ms
- Memory usage should be optimized for test runs

### Reliability
- All tests should pass consistently across different environments
- Tests should be deterministic and not flaky
- Proper cleanup should prevent test interference

### Maintainability
- Test code should be well-organized and documented
- Common test patterns should be reusable
- Mock setup should be flexible and configurable

## Testing Requirements

### Unit Tests
- Test all component rendering and interactions
- Verify hook behavior and state management
- Test utility functions and helpers
- Validate error handling and edge cases

### Integration Tests
- Test component integration and data flow
- Verify API service integration
- Test theme and context providers
- Validate drag and drop functionality

### Test Coverage
- Achieve >80% test coverage requirement
- Cover all critical user paths
- Test error scenarios and edge cases
- Verify accessibility features

## Code Examples

### Before (Failing Tests)
```typescript
// src/components/dashboard/Dashboard.test.tsx
describe('Dashboard', () => {
  it('renders dashboard', () => {
    render(<Dashboard />);
    // Test fails due to missing providers and real API calls
  });
});
```

### After (Fixed Tests)
```typescript
// src/components/dashboard/Dashboard.test.tsx
import { renderWithProviders } from '../../test/setup/testUtils';
import { MockApiService } from '../../test/mocks/apiMockService';

describe('Dashboard', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('renders dashboard', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

## Potential Risks

### Technical Risks
1. **Risk**: Test fixes might introduce new issues
   - **Mitigation**: Comprehensive test coverage and validation
   - **Mitigation**: Incremental changes with thorough testing

2. **Risk**: Mock setup might be complex and brittle
   - **Mitigation**: Keep mock setup simple and reusable
   - **Mitigation**: Use factory patterns for consistent data

3. **Risk**: Performance impact from test infrastructure
   - **Mitigation**: Optimize test setup and teardown
   - **Mitigation**: Profile test execution times

### Testing Risks
1. **Risk**: Tests might become flaky or unreliable
   - **Mitigation**: Proper test isolation and cleanup
   - **Mitigation**: Deterministic test data and behavior

2. **Risk**: Coverage might not reflect real usage
   - **Mitigation**: Focus on critical user paths
   - **Mitigation**: Regular review of test coverage

## Accessibility Considerations

### Test Accessibility
- Test keyboard navigation for all interactive elements
- Verify screen reader compatibility
- Test focus management and ARIA attributes
- Validate color contrast and visual accessibility

### Error Testing
- Test error message accessibility
- Verify error recovery mechanisms
- Test loading state announcements
- Validate error boundary behavior

## Success Criteria

### Code Quality
- [ ] All tests pass consistently
- [ ] Test coverage meets >80% requirement
- [ ] No real API calls in tests
- [ ] Proper error handling tested

### Test Reliability
- [ ] Tests run deterministically
- [ ] No flaky or intermittent failures
- [ ] Proper test isolation
- [ ] Comprehensive cleanup

### Performance
- [ ] Test suite completes within 30 seconds
- [ ] Individual tests complete within 100ms
- [ ] Memory usage is optimized
- [ ] No significant performance regression

### Maintainability
- [ ] Test code is well-organized
- [ ] Common patterns are reusable
- [ ] Documentation is comprehensive
- [ ] Mock setup is flexible

## Implementation Checklist

- [ ] Create global test setup and configuration
- [ ] Implement test utilities and helpers
- [ ] Fix Dashboard component tests
- [ ] Fix Sidebar component tests
- [ ] Fix Tile component tests
- [ ] Update API service tests with mocking
- [ ] Update hook tests with mocking
- [ ] Add comprehensive error testing
- [ ] Implement accessibility tests
- [ ] Verify test coverage meets >80% requirement
- [ ] Run full test suite to ensure all tests pass
- [ ] Optimize test performance
- [ ] Update test documentation
- [ ] Verify no real network calls in tests
- [ ] Check for test isolation issues
- [ ] Validate error handling coverage 
