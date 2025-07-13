/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './yahoo-finance';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Vercel request/response
const createMockRequest = (url: string, method = 'GET', headers = {}) => ({
  url,
  method,
  headers,
  body: undefined,
});

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    send: vi.fn(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('Yahoo Finance API Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards requests to Yahoo Finance API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/GDX?interval=1d&range=1d');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://query1.finance.yahoo.com/v8/finance/chart/GDX?interval=1d&range=1d',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Object),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('preserves query parameters', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/AAPL?interval=1d&range=1mo');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1mo',
      expect.any(Object),
    );
  });

  it('forwards response headers', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([
        ['content-type', 'application/json'],
        ['cache-control', 'max-age=3600'],
      ]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/GDX');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
    expect(res.setHeader).toHaveBeenCalledWith('cache-control', 'max-age=3600');
  });

  it('handles error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/INVALID');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/GDX');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Yahoo Finance API temporarily unavailable',
      message: 'Please try again later',
    });
  });

  it('removes host header from forwarded request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/yahoo-finance/v8/finance/chart/GDX', 'GET', {
      'content-type': 'application/json',
      host: 'localhost:3000',
      'user-agent': 'test-agent',
    });
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'user-agent': 'test-agent',
        }),
      }),
    );
    
    // Verify host header is not included
    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers).not.toHaveProperty('host');
  });
});
