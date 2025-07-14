import type { MockApiErrorType } from '../apiMockService';

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

export class MockApiError extends Error {
  public status: number;

  constructor(message: string = 'API error', status: number = 500) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
  }
}

export function createMockNetworkError(type: MockApiErrorType): Error {
  switch (type) {
    case 'network':
      return new MockNetworkError('Failed to fetch');
    case 'timeout':
      return new MockTimeoutError('Request timed out');
    case 'api':
      return new MockApiError('API Error: 500 Internal Server Error', 500);
    case 'malformed':
      return new Error('Invalid JSON response');
    default:
      return new Error('Unknown error');
  }
}

export function createMockResponse(
  status: number,
  data: unknown,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function createMockErrorResponse(status: number, errorMessage: string): Response {
  return new Response(JSON.stringify({ error: errorMessage }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
