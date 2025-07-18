import { MockApiService, type MockApiErrorType } from '../mocks/apiMockService';

export function setupMockApiService(): MockApiService {
  const mockService = MockApiService.getInstance();

  return mockService;
}

export function configureMockForTest(
  endpoint: string,
  config: {
    shouldFail?: boolean;
    errorType?: MockApiErrorType;
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
