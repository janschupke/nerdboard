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

// Mock the smart data fetcher to control test behavior
vi.mock('../../../../../utils/smartDataFetcher', () => ({
  SmartDataFetcher: {
    fetchWithBackgroundRefresh: vi.fn(),
  },
}));

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
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValueOnce({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'API request failed';
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return an error
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValueOnce({
      data: null,
      isCached: false,
      error: errorMessage,
      lastUpdated: null,
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should update time range and refetch data', async () => {
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockClear();

    // Update time range
    result.current.setTimeRange('3M');

    await waitFor(() => {
      expect(result.current.timeRange).toBe('3M');
    });

    // Should be called with new time range
    expect(vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh)).toHaveBeenCalled();
  });

  it('should refetch data when refetch is called', async () => {
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls to count only refetch
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockClear();

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => {
      expect(vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh)).toHaveBeenCalledTimes(1);
    });
  });

  it('should use custom refresh interval', async () => {
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    const customInterval = 60000; // 1 minute

    renderHook(() => useFederalFundsRateData(customInterval));

    await waitFor(() => {
      expect(vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh)).toHaveBeenCalled();
    });
  });

  it('should handle network errors', async () => {
    const networkError = 'Network error';
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return an error
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValueOnce({
      data: null,
      isCached: false,
      error: networkError,
      lastUpdated: null,
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(networkError);
  });

  it('should maintain state between re-renders', async () => {
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

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
    const { SmartDataFetcher } = await import('../../../../../utils/smartDataFetcher');
    
    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: mockData,
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    const { result } = renderHook(() => useFederalFundsRateData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.timeRange).toBe('1Y');
    expect(vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh)).toHaveBeenCalled();
  });
});
