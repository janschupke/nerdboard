export type MockApiErrorType = 'network' | 'timeout' | 'api' | 'malformed';

export interface MockApiConfig {
  delay?: number;
  shouldFail?: boolean;
  errorType?: MockApiErrorType;
  responseData?: unknown;
  status?: number;
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

  async mockRequest(endpoint: string): Promise<Response> {
    const config = this.mockConfigs.get(endpoint) || {};

    // Simulate network delay
    if (config.delay) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }

    // Simulate failures
    if (config.shouldFail) {
      throw this.createMockError(config.errorType || 'network');
    }

    // Return mock response
    const mockData = config.responseData;
    const status = config.status || 200;

    return new Response(JSON.stringify(mockData), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private createMockError(errorType: MockApiErrorType): Error {
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

  clearMocks(): void {
    this.mockConfigs.clear();
  }

  getMockConfig(endpoint: string): MockApiConfig | undefined {
    return this.mockConfigs.get(endpoint);
  }
}
