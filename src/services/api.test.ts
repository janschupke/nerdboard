import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiService } from './api';

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    apiService = new ApiService('http://localhost:3000');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make successful GET request', async () => {
    const mockResponse = { data: 'test data' };
    const mockFetch = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiService.get('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result).toEqual({
      data: mockResponse,
      error: null,
      loading: false,
    });
  });

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await apiService.get('/test-endpoint');

    expect(result).toEqual({
      data: null,
      error: expect.any(Error),
      loading: false,
    });
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await apiService.get('/test-endpoint');

    expect(result).toEqual({
      data: null,
      error: expect.any(Error),
      loading: false,
    });
  });

  it('should make successful POST request', async () => {
    const mockResponse = { success: true };
    const mockFetch = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const postData = { name: 'test' };
    const result = await apiService.post('/test-endpoint', postData);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result).toEqual({
      data: mockResponse,
      error: null,
      loading: false,
    });
  });

  it('should make successful PUT request', async () => {
    const mockResponse = { success: true };
    const mockFetch = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const putData = { name: 'test' };
    const result = await apiService.put('/test-endpoint', putData);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(putData),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result).toEqual({
      data: mockResponse,
      error: null,
      loading: false,
    });
  });

  it('should make successful DELETE request', async () => {
    const mockResponse = { success: true };
    const mockFetch = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiService.delete('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result).toEqual({
      data: mockResponse,
      error: null,
      loading: false,
    });
  });

  it('should include API key in headers when provided', async () => {
    const apiServiceWithKey = new ApiService('http://localhost:3000', 'test-api-key');
    const mockResponse = { data: 'test' };
    const mockFetch = vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await apiServiceWithKey.get('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-api-key',
        },
      }),
    );
  });

  it('should handle JSON parsing errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as unknown as Response);

    const result = await apiService.get('/test');

    expect(result).toEqual({
      data: null,
      error: expect.any(Error),
      loading: false,
    });
  });
});
