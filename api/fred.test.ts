/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './fred';

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe('FRED API Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards requests to FRED API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);
    const req = createMockRequest('/api/fred/series/observations?series_id=FEDFUNDS');
    const res = createMockResponse();
    await handler(req as any, res as any);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.stlouisfed.org/series/observations?series_id=FEDFUNDS',
      expect.objectContaining({ method: 'GET' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
}); 
