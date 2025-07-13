/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './uxc';

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

describe('UXC API Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards requests to UXC API', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);
    const req = createMockRequest('/api/uxc/p/data.asp');
    const res = createMockResponse();
    await handler(req as any, res as any);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.uxc.com/p/data.asp',
      expect.objectContaining({ method: 'GET' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
  it('handles 404 error from UXC API', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      headers: new Map(),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    mockFetch.mockResolvedValue(mockResponse);
    const req = createMockRequest('/api/uxc/invalid');
    const res = createMockResponse();
    await handler(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalled();
  });
  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const req = createMockRequest('/api/uxc/p/data.asp');
    const res = createMockResponse();
    await expect(handler(req as any, res as any)).rejects.toThrow('Network error');
  });
}); 
