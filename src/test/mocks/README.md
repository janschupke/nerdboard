# Test Mocks

This directory contains reusable mocks for testing components and services.

## Files

### `componentMocks.ts`

Contains mocks for React components and hooks used across the application.

**Exports:**

- `setupComponentMocks()` - Sets up all component mocks
- `resetComponentMocks()` - Resets mock state between tests
- `headerMock` - Mock function to capture Header component props
- `dragboardProviderProps` - Array to capture DragboardProvider props

**Mocks included:**

- Dragboard components (Provider, Grid, Tile)
- Tile component
- Header component
- LogView component
- Hook mocks (useTheme, useLogManager, useLogContext, useKeyboardNavigation)

### `apiMockService.ts`

Mock service for API testing with configurable responses and errors.

### `endpointMocks.ts`

Mock responses for specific API endpoints.

## Usage

### In Test Files

```typescript
// Setup mocks before any imports
import { vi } from 'vitest';
import { setupComponentMocks } from '../../test/mocks/componentMocks';

// Setup all component mocks
setupComponentMocks();

// Import test utilities
import { resetComponentMocks, headerMock } from '../../test/mocks/componentMocks';
import { render, screen, act } from '@testing-library/react';

describe('MyComponent', () => {
  beforeEach(() => {
    resetComponentMocks();
  });

  it('should render correctly', async () => {
    await act(async () => {
      render(<MyComponent />);
    });
    // Test implementation
  });
});
```

### Handling Suspense Warnings

If you encounter Suspense warnings in tests, wrap your render calls in `act()`:

```typescript
it('should render without Suspense warnings', async () => {
  await act(async () => {
    render(<ComponentWithSuspense />);
  });
  // Assertions here
});
```

### Adding New Mocks

1. Add the mock function to `componentMocks.ts`
2. Export any mock data or functions needed for testing
3. Update the `setupComponentMocks()` function to include the new mock
4. Document the mock in this README

## Best Practices

- Always call `resetComponentMocks()` in `beforeEach` to ensure clean state
- Use `data-testid` attributes in mocks for easy element selection
- Mock at the component level, not implementation details
- Provide the same API as the real components
- Export mock functions/data for assertions in tests
- Wrap render calls in `act()` when dealing with Suspense components
