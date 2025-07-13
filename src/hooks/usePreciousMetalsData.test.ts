import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { usePreciousMetalsData } from './usePreciousMetalsData';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';
import type { PreciousMetalsData } from '../types/preciousMetals';

describe('usePreciousMetalsData', () => {
  let service: PreciousMetalsApiService;

  const mockData: PreciousMetalsData = {
    gold: { price: 1950.5, change_24h: 12.3, change_percentage_24h: 0.63 },
    silver: { price: 25.1, change_24h: 0.2, change_percentage_24h: 0.8 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreciousMetalsApiService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading initially', () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockResolvedValue(mockData);
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    expect(result.current.loading).toBe(true);
  });

  it('returns data after loading', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockResolvedValue(mockData);
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.data).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
  });

  it('returns error on fetch failure', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockRejectedValue(
      new Error('Network error: Failed to fetch'),
    );
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Network error: Failed to fetch');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API errors correctly', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockRejectedValue(
      new Error('API error: 500 Internal Server Error'),
    );
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('API error: 500 Internal Server Error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles timeout errors correctly', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockRejectedValue(new Error('Request timeout'));
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Request timeout');
      expect(result.current.loading).toBe(false);
    });
  });

  it('increments retry count on error', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.retryCount).toBe(1);
    });
  });

  it('resets retry count on successful fetch', async () => {
    vi.spyOn(service, 'getPreciousMetalsData').mockResolvedValue(mockData);
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.retryCount).toBe(0);
    });
  });

  it('provides refetch function', async () => {
    const spy = vi.spyOn(service, 'getPreciousMetalsData').mockResolvedValue(mockData);
    const { result } = renderHook(() => usePreciousMetalsData(300000, service));
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    expect(typeof result.current.refetch).toBe('function');
    const newMockData: PreciousMetalsData = {
      gold: { price: 2000, change_24h: 20, change_percentage_24h: 1 },
      silver: { price: 30, change_24h: 1, change_percentage_24h: 3 },
    };
    spy.mockResolvedValueOnce(newMockData);
    result.current.refetch();
    await vi.waitFor(() => {
      expect(result.current.retryCount).toBe(0);
    });
  });
});
