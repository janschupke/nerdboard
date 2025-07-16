import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEuriborApi } from './useEuriborApi';
import { registerEcbEuriborDataMapper } from './dataMapper';

const mockApiResponse = {
  rates: [
    { date: '2024-06-01', value: '3.85' },
    { date: '2024-05-01', value: '3.80' },
  ],
};

global.fetch = vi.fn();

describe('useEuriborApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerEcbEuriborDataMapper();
  });

  it('fetches and maps ECB Euribor data successfully', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });
    const { result } = renderHook(() => useEuriborApi());
    let data: Awaited<ReturnType<ReturnType<typeof useEuriborApi>["getEuriborRate"]>> | undefined;
    await act(async () => {
      data = await result.current.getEuriborRate('test-tile');
    });
    expect(data).toBeDefined();
    if (data) {
      expect(data.currentRate).toBe(3.8);
      expect(data.historicalData.length).toBe(2);
      expect(data.lastUpdate).toBeInstanceOf(Date);
    }
  });

  it('throws error if API returns not ok', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });
    const { result } = renderHook(() => useEuriborApi());
    await expect(result.current.getEuriborRate('test-tile')).rejects.toThrow('ECB API error');
  });

  it('throws error if fetch fails', async () => {
    (fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useEuriborApi());
    await expect(result.current.getEuriborRate('test-tile')).rejects.toThrow('Network error');
  });
});
