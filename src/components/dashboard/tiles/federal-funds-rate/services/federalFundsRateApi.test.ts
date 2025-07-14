import { FederalFundsRateApiService } from './federalFundsRateApi';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';

vi.stubGlobal('fetch', vi.fn());

const mockResponse = {
  observations: [
    { date: '2024-01-01', value: '5.0' },
    { date: '2024-01-15', value: '5.25' },
  ],
};

describe('FederalFundsRateApiService', () => {
  let service: FederalFundsRateApiService;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure API key is available for tests that should use the API
    originalApiKey = import.meta.env.VITE_FRED_API_KEY;
    (import.meta.env as Record<string, string>).VITE_FRED_API_KEY = 'test-api-key';
    service = new FederalFundsRateApiService();
    (service as unknown as { cache: Map<string, unknown> }).cache.clear();
  });

  afterEach(() => {
    // Restore original API key
    if (originalApiKey) {
      (import.meta.env as Record<string, string>).VITE_FRED_API_KEY = originalApiKey;
    } else {
      delete (import.meta.env as Record<string, string>).VITE_FRED_API_KEY;
    }
  });

  it('returns parsed data from fetch', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await service.getFederalFundsRateData('1Y');

    expect(data.currentRate).toBe(5.25);
    expect(data.historicalData.length).toBe(2);
    expect(data.historicalData[0]).toEqual({
      date: new Date('2024-01-01'),
      rate: 5.0,
    });
    expect(data.historicalData[1]).toEqual({
      date: new Date('2024-01-15'),
      rate: 5.25,
    });
    expect(fetch).toHaveBeenCalled();
  });

  it('handles missing data points', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        observations: [
          { date: '2024-01-01', value: '5.0' },
          { date: '2024-01-10', value: '.' }, // Missing data point
          { date: '2024-01-15', value: '5.25' },
        ],
      }),
    });

    const data = await service.getFederalFundsRateData('1Y');

    // Should filter out the missing data point (value: '.')
    expect(data.historicalData.length).toBe(2);
    expect(data.historicalData[0].rate).toBe(5.0);
    expect(data.historicalData[1].rate).toBe(5.25);
  });

  it('falls back to mock data on fetch error', async () => {
    (fetch as unknown as Mock).mockRejectedValueOnce(new Error('Network error'));

    const data = await service.getFederalFundsRateData('1Y');

    expect(data.currentRate).toBeGreaterThan(0);
    expect(data.historicalData.length).toBeGreaterThan(0);
  });

  it('falls back to mock data on bad response', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const data = await service.getFederalFundsRateData('1Y');

    expect(data.currentRate).toBeGreaterThan(0);
    expect(data.historicalData.length).toBeGreaterThan(0);
  });

  it('falls back to mock data on empty observations', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ observations: [] }),
    });

    const data = await service.getFederalFundsRateData('1Y');

    expect(data.currentRate).toBeGreaterThan(0);
    expect(data.historicalData.length).toBeGreaterThan(0);
  });

  it('falls back to mock data when API key is missing', async () => {
    // Clear API key for this test
    delete (import.meta.env as Record<string, string>).VITE_FRED_API_KEY;

    const data = await service.getFederalFundsRateData('1Y');

    expect(data.currentRate).toBeGreaterThan(0);
    expect(data.historicalData.length).toBeGreaterThan(0);
  });
});
