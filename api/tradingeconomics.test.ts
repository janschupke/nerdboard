/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './tradingeconomics';

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

describe('TradingEconomics API Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards requests to TradingEconomics API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const req = createMockRequest('/api/tradingeconomics/commodity/uranium?range=1Y');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tradingeconomics.com/commodity/uranium?range=1Y',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          host: undefined,
        }),
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

    const req = createMockRequest('/api/tradingeconomics/commodity/gold?period=1M&format=json');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tradingeconomics.com/commodity/gold?period=1M&format=json',
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

    const req = createMockRequest('/api/tradingeconomics/commodity/uranium');
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

    const req = createMockRequest('/api/tradingeconomics/invalid/endpoint');
    const res = createMockResponse();

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const req = createMockRequest('/api/tradingeconomics/commodity/uranium');
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

    const req = createMockRequest('/api/tradingeconomics/commodity/uranium', 'GET', {
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
      }),
    );
  });
});
