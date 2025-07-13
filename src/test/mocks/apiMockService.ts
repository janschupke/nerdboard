export interface MockApiConfig {
  delay?: number;
  shouldFail?: boolean;
  errorType?: 'network' | 'timeout' | 'api' | 'malformed';
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
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }

    // Simulate failures
    if (config.shouldFail) {
      throw this.createMockError(config.errorType || 'network');
    }

    // Return mock response
    const mockData = config.responseData || this.getDefaultResponse(endpoint);
    const status = config.status || 200;
    
    return new Response(JSON.stringify(mockData), {
      status,
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

  private getDefaultResponse(endpoint: string): unknown {
    if (endpoint.includes('cryptocurrency') || endpoint.includes('coins')) {
      return this.getDefaultCryptocurrencyResponse();
    }
    if (endpoint.includes('precious-metals') || endpoint.includes('metals')) {
      return this.getDefaultPreciousMetalsResponse();
    }
    return {};
  }

  private getDefaultCryptocurrencyResponse(): unknown {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        market_cap: 850000000000,
        price_change_percentage_24h: 2.5,
        last_updated: new Date().toISOString(),
      },
    ];
  }

  private getDefaultPreciousMetalsResponse(): unknown {
    return {
      gold: { price: 1950.50, change_24h: 12.30, change_percentage_24h: 0.63 },
      silver: { price: 25.10, change_24h: 0.20, change_percentage_24h: 0.80 },
    };
  }

  clearMocks(): void {
    this.mockConfigs.clear();
  }

  getMockConfig(endpoint: string): MockApiConfig | undefined {
    return this.mockConfigs.get(endpoint);
  }
} 
