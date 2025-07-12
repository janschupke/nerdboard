import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { usePreciousMetalsData } from './usePreciousMetalsData';
import { waitFor } from '@testing-library/react';
import { PreciousMetalsApiService } from '../services/preciousMetalsApi';

describe('usePreciousMetalsData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading initially', () => {
    const { result } = renderHook(() => usePreciousMetalsData());
    expect(result.current.loading).toBe(true);
  });

  it('returns data after loading', async () => {
    const { result } = renderHook(() => usePreciousMetalsData());
    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns error on fetch failure', async () => {
    const mockService = {
      getPreciousMetalsData: vi.fn().mockRejectedValue(new Error('Failed to load precious metals data')),
    } as unknown as PreciousMetalsApiService;
    const { result } = renderHook(() => usePreciousMetalsData(300000, mockService));
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load precious metals data');
      expect(result.current.loading).toBe(false);
    });
  });
}); 
