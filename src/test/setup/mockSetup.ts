import { MockApiService } from '../mocks/apiMockService';
import { createCryptocurrencyListMockData } from '../mocks/factories/cryptocurrencyFactory';
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
  config: {
    shouldFail?: boolean;
    errorType?: 'network' | 'timeout' | 'api' | 'malformed';
    responseData?: unknown;
    delay?: number;
  },
): void {
  const mockService = MockApiService.getInstance();
  mockService.configureMock(endpoint, config);
}

export function clearAllMocks(): void {
  const mockService = MockApiService.getInstance();
  mockService.clearMocks();
}

export function setupDefaultMocks(): void {
  const mockService = MockApiService.getInstance();

  // Default cryptocurrency mock
  mockService.configureMock('/api/coins/markets', {
    responseData: createCryptocurrencyListMockData(10),
    delay: 50,
  });

  // Default precious metals mock
  mockService.configureMock('/api/metals/prices', {
    responseData: createPreciousMetalsListMockData(),
    delay: 75,
  });
}
