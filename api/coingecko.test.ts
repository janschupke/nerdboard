/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './coingecko';

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
  };
  return res;
};

describe('CoinGecko API Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards requests to CoinGecko API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/coingecko/api/v3/coins/markets?vs_currency=usd');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          host: undefined,
        }),
      })
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

    const req = createMockRequest('/api/coingecko/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30',
      expect.any(Object)
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

    const req = createMockRequest('/api/coingecko/api/v3/coins/markets');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
    expect(res.setHeader).toHaveBeenCalledWith('cache-control', 'max-age=3600');
  });

  it('handles error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 429, // Rate limit
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/coingecko/api/v3/invalid/endpoint');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const req = createMockRequest('/api/coingecko/api/v3/coins/markets');
    const res = createMockResponse();

    await expect(handler(req as any, res as any)).rejects.toThrow('Network error');
  });

  it('removes host header from forwarded request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/coingecko/api/v3/coins/markets', 'GET', {
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
          host: undefined,
          'user-agent': 'test-agent',
        }),
      })
    );
  });
}); 
