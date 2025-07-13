import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useFederalFundsRateData } from './useFederalFundsRateData';

declare global {
  var __mockGetFederalFundsRateData: Mock;
}

vi.mock('../services/federalFundsRateApi', () => {
  globalThis.__mockGetFederalFundsRateData = vi.fn();
  return {
    FederalFundsRateApiService: vi.fn().mockImplementation(() => ({
      getFederalFundsRateData: globalThis.__mockGetFederalFundsRateData,
    })),
  };
});

type MockGetFederalFundsRateData = Mock;

const mockData = {
  currentRate: 5.25,
  lastUpdate: new Date('2024-01-15T10:00:00Z'),
  historicalData: [
    { date: new Date('2024-01-01T00:00:00Z'), rate: 5.0 },
    { date: new Date('2024-01-15T00:00:00Z'), rate: 5.25 },
  ],
};

describe('useFederalFundsRateData', () => {
  const getMock = (): MockGetFederalFundsRateData => globalThis.__mockGetFederalFundsRateData;

  beforeEach(() => {
    vi.clearAllMocks();
    getMock().mockClear();
  });

  it('should fetch data successfully', async () => {
    getMock().mockResolvedValueOnce(mockData);
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(getMock()).toHaveBeenCalledWith('1Y');
  });

  it('should handle API errors', async () => {
    const errorMessage = 'API request failed';
    getMock().mockRejectedValueOnce(new Error(errorMessage));
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should update time range and refetch data', async () => {
    getMock().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Clear previous calls
    getMock().mockClear();
    
    // Update time range
    result.current.setTimeRange('3M');
    
    await waitFor(() => {
      expect(result.current.timeRange).toBe('3M');
    });
    
    // Should be called with new time range
    expect(getMock()).toHaveBeenCalledWith('3M');
  });

  it('should refetch data when refetch is called', async () => {
    getMock().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Clear previous calls to count only refetch
    getMock().mockClear();
    
    // Trigger refetch
    result.current.refetch();
    
    await waitFor(() => {
      expect(getMock()).toHaveBeenCalledTimes(1);
    });
  });

  it('should use custom refresh interval', async () => {
    getMock().mockResolvedValue(mockData);
    const customInterval = 60000; // 1 minute
    
    renderHook(() => useFederalFundsRateData(customInterval));
    
    await waitFor(() => {
      expect(getMock()).toHaveBeenCalled();
    });
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    getMock().mockRejectedValueOnce(networkError);
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBe(null);
  });

  it('should maintain state between re-renders', async () => {
    getMock().mockResolvedValue(mockData);
    
    const { result, rerender } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    rerender();
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle default time range', async () => {
    getMock().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useFederalFundsRateData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.timeRange).toBe('1Y');
    expect(getMock()).toHaveBeenCalledWith('1Y');
  });
}); 
