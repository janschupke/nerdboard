# PRP-1703123456789-03-API-Error-Integration

## Feature: API Error Integration

### Overview

Integrate the API logging system with existing API services to automatically capture and log API errors and warnings, preventing them from appearing in the browser console while maintaining the existing error handling functionality.

### Functional Requirements

- [ ] Integrate error interceptor with existing API services
- [ ] Prevent API errors from appearing in browser console
- [ ] Maintain existing error handling functionality
- [ ] Add logging to all API proxy endpoints
- [ ] Ensure graceful degradation when logging fails

### Technical Implementation

#### 1. Update API Service Base Class

**File**: `src/services/api.ts` (update existing)

```typescript
import { interceptAPIError, interceptAPIWarning, APIError } from './apiErrorInterceptor';

// ... existing code ...

export class APIService {
  // ... existing methods ...

  protected async handleError(error: any, apiCall: string, context?: Record<string, any>): Promise<never> {
    const errorInfo: APIError = {
      apiCall,
      reason: this.extractErrorMessage(error),
      details: {
        status: error.status || error.statusCode,
        url: error.url || context?.url,
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // Log the error to our storage system instead of console
    interceptAPIError(errorInfo);

    // Re-throw the error for existing error handling
    throw error;
  }

  protected async handleWarning(warning: any, apiCall: string, context?: Record<string, any>): Promise<void> {
    const warningInfo: APIError = {
      apiCall,
      reason: this.extractWarningMessage(warning),
      details: {
        status: warning.status || warning.statusCode,
        url: warning.url || context?.url,
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // Log the warning to our storage system instead of console
    interceptAPIWarning(warningInfo);
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.statusText) return error.statusText;
    return 'Unknown API error';
  }

  private extractWarningMessage(warning: any): string {
    if (typeof warning === 'string') return warning;
    if (warning?.message) return warning.message;
    if (warning?.warning) return warning.warning;
    return 'Unknown API warning';
  }
}
```

#### 2. Update CoinGecko API Service

**File**: `src/services/coinGeckoApi.ts` (update existing)

```typescript
import { APIService } from './api';
import { interceptAPIError, interceptAPIWarning, APIError } from './apiErrorInterceptor';

export class CoinGeckoAPI extends APIService {
  // ... existing code ...

  async getCryptocurrencyData(ids: string[]): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorInfo: APIError = {
          apiCall: 'CoinGecko: getCryptocurrencyData',
          reason: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            url: response.url,
            ids,
          },
        };
        interceptAPIError(errorInfo);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log warnings for missing data
      const missingIds = ids.filter(id => !data[id]);
      if (missingIds.length > 0) {
        const warningInfo: APIError = {
          apiCall: 'CoinGecko: getCryptocurrencyData',
          reason: `Missing data for: ${missingIds.join(', ')}`,
          details: {
            missingIds,
            receivedIds: Object.keys(data),
          },
        };
        interceptAPIWarning(warningInfo);
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'CoinGecko: getCryptocurrencyData', { ids });
    }
  }

  // ... update other methods similarly ...
}
```

#### 3. Update Precious Metals API Service

**File**: `src/services/preciousMetalsApi.ts` (update existing)

```typescript
import { APIService } from './api';
import { interceptAPIError, interceptAPIWarning, APIError } from './apiErrorInterceptor';

export class PreciousMetalsAPI extends APIService {
  // ... existing code ...

  async getPreciousMetalsData(): Promise<any> {
    try {
      // Simulate API call with potential errors
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/precious-metals`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorInfo: APIError = {
          apiCall: 'PreciousMetals: getPreciousMetalsData',
          reason: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            url: response.url,
          },
        };
        interceptAPIError(errorInfo);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate data structure
      if (!data.gold || !data.silver) {
        const warningInfo: APIError = {
          apiCall: 'PreciousMetals: getPreciousMetalsData',
          reason: 'Incomplete data structure received',
          details: {
            receivedKeys: Object.keys(data),
            expectedKeys: ['gold', 'silver'],
          },
        };
        interceptAPIWarning(warningInfo);
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'PreciousMetals: getPreciousMetalsData');
    }
  }
}
```

#### 4. Update API Proxy Endpoints

**File**: `api/coingecko.ts` (update existing)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ids, vs_currencies = 'usd' } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'Missing required parameter: ids' });
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=true&include_market_cap=true`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Nerdboard/1.0',
      },
    });

    if (!response.ok) {
      // Log error to client-side storage (will be captured by client)
      const errorData = {
        apiCall: 'CoinGecko API Proxy',
        reason: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          url: url,
          timestamp: new Date().toISOString(),
        },
      };
      
      return res.status(response.status).json({
        error: errorData.reason,
        details: errorData.details,
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    const errorData = {
      apiCall: 'CoinGecko API Proxy',
      reason: error instanceof Error ? error.message : 'Unknown error',
      details: {
        timestamp: new Date().toISOString(),
      },
    };
    
    res.status(500).json({
      error: errorData.reason,
      details: errorData.details,
    });
  }
}
```

#### 5. Update API Error Handler Utility

**File**: `src/utils/errorHandling.ts` (update existing)

```typescript
import { interceptAPIError, interceptAPIWarning, APIError } from '../services/apiErrorInterceptor';

// ... existing code ...

export const handleAPIError = (error: any, apiCall: string, context?: Record<string, any>): void => {
  const errorInfo: APIError = {
    apiCall,
    reason: extractErrorMessage(error),
    details: {
      status: error.status || error.statusCode,
      url: error.url || context?.url,
      timestamp: new Date().toISOString(),
      ...context,
    },
  };

  // Log to our storage system instead of console
  interceptAPIError(errorInfo);
};

export const handleAPIWarning = (warning: any, apiCall: string, context?: Record<string, any>): void => {
  const warningInfo: APIError = {
    apiCall,
    reason: extractWarningMessage(warning),
    details: {
      timestamp: new Date().toISOString(),
      ...context,
    },
  };

  // Log to our storage system instead of console
  interceptAPIWarning(warningInfo);
};

// ... existing helper functions ...
```

#### 6. Update Tile Data Hooks

**File**: `src/hooks/useCryptocurrencyData.ts` (update existing)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { coinGeckoAPI } from '../services/coinGeckoApi';
import { interceptAPIError, interceptAPIWarning, APIError } from '../services/apiErrorInterceptor';

export const useCryptocurrencyData = (ids: string[]) => {
  // ... existing state ...

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await coinGeckoAPI.getCryptocurrencyData(ids);
      setData(data);
    } catch (error) {
      const errorInfo: APIError = {
        apiCall: 'Cryptocurrency Data Hook',
        reason: error instanceof Error ? error.message : 'Unknown error',
        details: {
          ids,
          timestamp: new Date().toISOString(),
        },
      };
      
      interceptAPIError(errorInfo);
      setError(errorInfo.reason);
    } finally {
      setLoading(false);
    }
  }, [ids]);

  // ... rest of existing code ...
};
```

### Testing Requirements

#### Unit Tests

**File**: `src/services/apiErrorInterceptor.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interceptAPIError, interceptAPIWarning } from './apiErrorInterceptor';
import { logStorageService } from './logStorageService';

vi.mock('./logStorageService');

describe('API Error Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logStorageService.addLog).mockClear();
  });

  it('should intercept API errors and log them', () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const errorInfo = {
      apiCall: 'test-api',
      reason: 'Test error',
      details: { status: 500 },
    };

    interceptAPIError(errorInfo);

    expect(logStorageService.addLog).toHaveBeenCalledWith({
      level: 'error',
      apiCall: 'test-api',
      reason: 'Test error',
      details: { status: 500 },
    });

    expect(console.error).not.toHaveBeenCalled();

    console.error = originalConsoleError;
  });

  it('should intercept API warnings and log them', () => {
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    const warningInfo = {
      apiCall: 'test-api',
      reason: 'Test warning',
      details: { status: 200 },
    };

    interceptAPIWarning(warningInfo);

    expect(logStorageService.addLog).toHaveBeenCalledWith({
      level: 'warning',
      apiCall: 'test-api',
      reason: 'Test warning',
      details: { status: 200 },
    });

    expect(console.warn).not.toHaveBeenCalled();

    console.warn = originalConsoleWarn;
  });
});
```

**File**: `src/services/api.test.ts` (update existing)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIService } from './api';
import { logStorageService } from './logStorageService';

vi.mock('./logStorageService');

class TestAPIService extends APIService {
  constructor() {
    super('https://test-api.com');
  }

  async testErrorHandling() {
    const error = new Error('Test error');
    return this.handleError(error, 'test-api-call', { test: 'context' });
  }

  async testWarningHandling() {
    const warning = { message: 'Test warning' };
    return this.handleWarning(warning, 'test-api-call', { test: 'context' });
  }
}

describe('APIService Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle errors and log them', async () => {
    const service = new TestAPIService();
    
    await expect(service.testErrorHandling()).rejects.toThrow('Test error');
    
    expect(logStorageService.addLog).toHaveBeenCalledWith({
      level: 'error',
      apiCall: 'test-api-call',
      reason: 'Test error',
      details: expect.objectContaining({
        test: 'context',
      }),
    });
  });

  it('should handle warnings and log them', async () => {
    const service = new TestAPIService();
    
    await service.testWarningHandling();
    
    expect(logStorageService.addLog).toHaveBeenCalledWith({
      level: 'warning',
      apiCall: 'test-api-call',
      reason: 'Test warning',
      details: expect.objectContaining({
        test: 'context',
      }),
    });
  });
});
```

### Integration Requirements

#### Update All API Services

Update all existing API services to use the new error handling:

- `src/services/coinGeckoApi.ts`
- `src/services/preciousMetalsApi.ts`
- `src/services/federalFundsRateApi.ts`
- `src/services/weatherApi.ts`
- `src/services/uraniumApi.ts`
- `src/services/gdxEtfApi.ts`

#### Update All API Proxy Endpoints

Update all API proxy endpoints in the `api/` directory:

- `api/coingecko.ts`
- `api/preciousMetals.ts`
- `api/fred.ts`
- `api/weather.ts`
- `api/uranium.ts`
- `api/gdxEtf.ts`

### Non-Functional Requirements

- **Performance**: Error logging should not impact API response times
- **Reliability**: Graceful degradation when logging system fails
- **Compatibility**: Maintain existing error handling patterns
- **Memory**: Efficient error object handling to prevent memory leaks

### Accessibility Considerations

- **Error Handling**: Silent operation to avoid disrupting user experience
- **Data Integrity**: Ensure error information is preserved for debugging
- **User Feedback**: Maintain existing user-facing error messages

### Risk Assessment

- **Risk**: Error logging system fails and breaks API calls
  - **Impact**: High
  - **Mitigation**: Graceful fallback to original error handling

- **Risk**: Performance impact from synchronous logging
  - **Impact**: Medium
  - **Mitigation**: Asynchronous logging operations

- **Risk**: Storage quota exceeded with high error volume
  - **Impact**: Medium
  - **Mitigation**: Implement log rotation and size limits

### Success Criteria

- [ ] All API errors are captured and logged to storage
- [ ] No API errors appear in browser console
- [ ] Existing error handling functionality is preserved
- [ ] All API services are updated with new error handling
- [ ] All API proxy endpoints are updated
- [ ] Error logging doesn't impact API performance
- [ ] All unit tests pass with >80% coverage
- [ ] Integration with existing services works correctly 
