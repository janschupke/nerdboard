# PRP-1752360009000-02: Implement Comprehensive API Mocking Strategy

## Feature Overview

This PRP implements a comprehensive API mocking strategy to replace all real API calls in tests with consistent mocked responses. The goal is to create a reliable, isolated testing environment that prevents tests from making real network calls while providing realistic test data.

## User-Facing Description

Developers will benefit from faster, more reliable tests that don't depend on external services. The testing experience will be more consistent and predictable, with better error simulation capabilities.

## Functional Requirements

### 1. Centralized Mock API Service
- Create a centralized mock API service for all external API calls
- Implement consistent mock response patterns
- Provide configurable mock behavior for different test scenarios
- Ensure complete isolation from real network calls

### 2. Mock Data Factories
- Create factories for cryptocurrency data generation
- Implement factories for precious metals data
- Provide realistic mock data that matches real API structure
- Support different data states (loading, success, error)

### 3. Error Simulation
- Mock network errors and timeouts
- Simulate API failures and malformed responses
- Provide configurable error scenarios
- Test error handling and recovery mechanisms

### 4. Cache Behavior Testing
- Mock cache behavior and expiration scenarios
- Test cache invalidation and refresh logic
- Simulate cache hits and misses
- Verify proper cache management

## Technical Requirements

### File Structure Changes
```
src/
├── test/
│   ├── mocks/
│   │   ├── apiMockService.ts     # Centralized mock API service
│   │   ├── factories/
│   │   │   ├── cryptocurrencyFactory.ts
│   │   │   └── preciousMetalsFactory.ts
│   │   ├── responses/
│   │   │   ├── cryptocurrencyResponses.ts
│   │   │   └── preciousMetalsResponses.ts
│   │   └── errors/
│   │       ├── networkErrors.ts
│   │       └── apiErrors.ts
│   └── setup/
│       └── mockSetup.ts          # Test setup and configuration
```

### Implementation Details

#### 1. Centralized Mock API Service
```typescript
// src/test/mocks/apiMockService.ts
export interface MockApiConfig {
  delay?: number;
  shouldFail?: boolean;
  errorType?: 'network' | 'timeout' | 'api' | 'malformed';
  responseData?: any;
}

export class MockApiService {
  private static instance: MockApiService;
  private mockConfigs: Map<string, MockApiConfig> = new Map();

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  configureMock(endpoint: string, config: MockApiConfig): void {
    this.mockConfigs.set(endpoint, config);
  }

  async mockRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = this.mockConfigs.get(endpoint) || {};
    
    // Simulate network delay
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }

    // Simulate failures
    if (config.shouldFail) {
      throw this.createMockError(config.errorType || 'network');
    }

    // Return mock response
    const mockData = config.responseData || this.getDefaultResponse(endpoint);
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private createMockError(errorType: string): Error {
    switch (errorType) {
      case 'network':
        return new Error('Network error: Failed to fetch');
      case 'timeout':
        return new Error('Request timeout');
      case 'api':
        return new Error('API error: 500 Internal Server Error');
      case 'malformed':
        return new Error('Invalid JSON response');
      default:
        return new Error('Unknown error');
    }
  }

  private getDefaultResponse(endpoint: string): any {
    if (endpoint.includes('cryptocurrency')) {
      return createCryptocurrencyMockData();
    }
    if (endpoint.includes('precious-metals')) {
      return createPreciousMetalsMockData();
    }
    return {};
  }
}
```

#### 2. Cryptocurrency Data Factory
```typescript
// src/test/mocks/factories/cryptocurrencyFactory.ts
export interface CryptocurrencyMockData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export function createCryptocurrencyMockData(
  overrides: Partial<CryptocurrencyMockData> = {}
): CryptocurrencyMockData {
  return {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 45000,
    market_cap: 850000000000,
    price_change_percentage_24h: 2.5,
    last_updated: new Date().toISOString(),
    ...overrides,
  };
}

export function createCryptocurrencyListMockData(count: number = 10): CryptocurrencyMockData[] {
  const cryptocurrencies = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'];
  
  return Array.from({ length: count }, (_, index) => 
    createCryptocurrencyMockData({
      id: cryptocurrencies[index % cryptocurrencies.length],
      symbol: cryptocurrencies[index % cryptocurrencies.length].substring(0, 3).toUpperCase(),
      name: cryptocurrencies[index % cryptocurrencies.length].charAt(0).toUpperCase() + 
             cryptocurrencies[index % cryptocurrencies.length].slice(1),
      current_price: 10000 + (index * 1000),
      market_cap: 1000000000 + (index * 100000000),
      price_change_percentage_24h: (Math.random() - 0.5) * 20,
    })
  );
}
```

#### 3. Precious Metals Data Factory
```typescript
// src/test/mocks/factories/preciousMetalsFactory.ts
export interface PreciousMetalsMockData {
  metal: string;
  price: number;
  unit: string;
  change_24h: number;
  change_percentage: number;
  last_updated: string;
}

export function createPreciousMetalsMockData(
  overrides: Partial<PreciousMetalsMockData> = {}
): PreciousMetalsMockData {
  return {
    metal: 'gold',
    price: 1950.50,
    unit: 'USD/oz',
    change_24h: 15.25,
    change_percentage: 0.79,
    last_updated: new Date().toISOString(),
    ...overrides,
  };
}

export function createPreciousMetalsListMockData(): PreciousMetalsMockData[] {
  return [
    createPreciousMetalsMockData({ metal: 'gold', price: 1950.50 }),
    createPreciousMetalsMockData({ metal: 'silver', price: 24.75 }),
    createPreciousMetalsMockData({ metal: 'platinum', price: 950.00 }),
    createPreciousMetalsMockData({ metal: 'palladium', price: 1200.00 }),
  ];
}
```

#### 4. Error Simulation
```typescript
// src/test/mocks/errors/networkErrors.ts
export class MockNetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'MockNetworkError';
  }
}

export class MockTimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'MockTimeoutError';
  }
}

export function createMockNetworkError(type: 'network' | 'timeout' | 'api'): Error {
  switch (type) {
    case 'network':
      return new MockNetworkError('Failed to fetch');
    case 'timeout':
      return new MockTimeoutError('Request timed out');
    case 'api':
      return new Error('API Error: 500 Internal Server Error');
    default:
      return new Error('Unknown error');
  }
}
```

#### 5. Test Setup Configuration
```typescript
// src/test/setup/mockSetup.ts
import { MockApiService } from '../mocks/apiMockService';
import { createCryptocurrencyMockData, createCryptocurrencyListMockData } from '../mocks/factories/cryptocurrencyFactory';
import { createPreciousMetalsListMockData } from '../mocks/factories/preciousMetalsFactory';

export function setupMockApiService(): MockApiService {
  const mockService = MockApiService.getInstance();
  
  // Configure default responses
  mockService.configureMock('/api/cryptocurrency', {
    responseData: createCryptocurrencyListMockData(),
    delay: 100,
  });
  
  mockService.configureMock('/api/precious-metals', {
    responseData: createPreciousMetalsListMockData(),
    delay: 150,
  });
  
  return mockService;
}

export function configureMockForTest(
  endpoint: string, 
  config: { shouldFail?: boolean; errorType?: string; responseData?: any }
): void {
  const mockService = MockApiService.getInstance();
  mockService.configureMock(endpoint, config);
}
```

### Component Updates Required

#### 1. Update API Service Tests
```typescript
// src/services/coinGeckoApi.test.ts
import { MockApiService } from '../test/mocks/apiMockService';
import { createCryptocurrencyMockData } from '../test/mocks/factories/cryptocurrencyFactory';

describe('CoinGecko API Service', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
    // Configure mock for this test
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: createCryptocurrencyMockData(),
      delay: 50,
    });
  });

  it('should fetch cryptocurrency data successfully', async () => {
    const result = await fetchCryptocurrencyData();
    expect(result).toBeDefined();
    expect(result.current_price).toBe(45000);
  });

  it('should handle network errors gracefully', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      shouldFail: true,
      errorType: 'network',
    });

    await expect(fetchCryptocurrencyData()).rejects.toThrow('Network error');
  });
});
```

#### 2. Update Hook Tests
```typescript
// src/hooks/useCryptocurrencyData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { MockApiService } from '../test/mocks/apiMockService';
import { createCryptocurrencyListMockData } from '../test/mocks/factories/cryptocurrencyFactory';

describe('useCryptocurrencyData Hook', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('should load cryptocurrency data successfully', async () => {
    const mockData = createCryptocurrencyListMockData(5);
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: mockData,
      delay: 100,
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading states correctly', async () => {
    mockApiService.configureMock('/api/cryptocurrency', {
      delay: 200,
    });

    const { result } = renderHook(() => useCryptocurrencyData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```

## Non-Functional Requirements

### Performance
- Mock responses should be returned within 50-200ms to simulate real API behavior
- Mock setup should not impact test execution time significantly
- Memory usage should be minimal for mock data

### Reliability
- All tests should be deterministic and not depend on external services
- Mock data should be consistent across test runs
- Error scenarios should be reproducible

### Maintainability
- Mock data should be easy to update when API structure changes
- Mock configuration should be flexible and reusable
- Documentation should be comprehensive

## Testing Requirements

### Unit Tests
- Test all mock factories for proper data generation
- Verify error simulation works correctly
- Test mock API service configuration
- Validate mock response structure

### Integration Tests
- Test API service integration with mocked endpoints
- Verify hook behavior with mocked data
- Test error handling and recovery scenarios
- Validate cache behavior with mocked responses

### Test Coverage
- Achieve >80% test coverage for all mocked components
- Test all error scenarios and edge cases
- Verify loading states and data transitions
- Test timeout and network error handling

## Code Examples

### Before (Real API Calls in Tests)
```typescript
// src/services/coinGeckoApi.test.ts
describe('CoinGecko API', () => {
  it('should fetch cryptocurrency data', async () => {
    const data = await fetchCryptocurrencyData();
    expect(data).toBeDefined();
    // This test depends on external API and may fail
  });
});
```

### After (Mocked API Calls)
```typescript
// src/services/coinGeckoApi.test.ts
import { MockApiService } from '../test/mocks/apiMockService';
import { createCryptocurrencyMockData } from '../test/mocks/factories/cryptocurrencyFactory';

describe('CoinGecko API', () => {
  let mockApiService: MockApiService;

  beforeEach(() => {
    mockApiService = MockApiService.getInstance();
  });

  it('should fetch cryptocurrency data', async () => {
    const mockData = createCryptocurrencyMockData();
    mockApiService.configureMock('/api/cryptocurrency', {
      responseData: mockData,
    });

    const data = await fetchCryptocurrencyData();
    expect(data).toEqual(mockData);
  });
});
```

## Potential Risks

### Technical Risks
1. **Risk**: Mock data might not match real API structure
   - **Mitigation**: Regular updates to mock data when API changes
   - **Mitigation**: Comprehensive validation of mock response structure

2. **Risk**: Tests might become brittle if mock setup is complex
   - **Mitigation**: Keep mock setup simple and reusable
   - **Mitigation**: Use factory patterns for consistent mock data

3. **Risk**: Performance impact from mock service overhead
   - **Mitigation**: Optimize mock service implementation
   - **Mitigation**: Profile test execution times

### Testing Risks
1. **Risk**: Tests might not catch real API integration issues
   - **Mitigation**: Maintain integration tests with real APIs
   - **Mitigation**: Regular validation against real API responses

2. **Risk**: Mock data might become outdated
   - **Mitigation**: Regular review and update of mock data
   - **Mitigation**: Automated validation of mock data structure

## Accessibility Considerations

### Test Accessibility
- Mock data should include accessibility-related fields if applicable
- Error messages should be accessible and screen reader friendly
- Loading states should be properly announced

### Error Handling
- Mock errors should provide meaningful error messages
- Error states should be properly handled in UI components
- Recovery mechanisms should be tested

## Success Criteria

### Code Quality
- [ ] All real API calls replaced with mocked endpoints in tests
- [ ] Mock data factories produce realistic and consistent data
- [ ] Error simulation covers all relevant scenarios
- [ ] Mock service is properly configured for all test scenarios

### Test Reliability
- [ ] All tests pass consistently without external dependencies
- [ ] Mock responses are returned within expected timeframes
- [ ] Error scenarios are properly tested and handled
- [ ] Cache behavior is properly mocked and tested

### Performance
- [ ] Test execution time is not significantly impacted
- [ ] Mock service overhead is minimal
- [ ] Memory usage is optimized for mock data

### Maintainability
- [ ] Mock data is easy to update and maintain
- [ ] Mock configuration is flexible and reusable
- [ ] Documentation is comprehensive and up-to-date

## Implementation Checklist

- [ ] Create mock API service structure
- [ ] Implement cryptocurrency data factory
- [ ] Implement precious metals data factory
- [ ] Create error simulation utilities
- [ ] Set up test configuration and setup
- [ ] Update all API service tests to use mocks
- [ ] Update all hook tests to use mocks
- [ ] Test error scenarios and edge cases
- [ ] Verify cache behavior with mocked responses
- [ ] Update test documentation
- [ ] Run full test suite to ensure all tests pass
- [ ] Verify no real network calls are made during tests
- [ ] Check test coverage meets >80% requirement
- [ ] Validate mock data structure against real API responses 
