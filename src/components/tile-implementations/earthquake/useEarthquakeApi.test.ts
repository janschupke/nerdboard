import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEarthquakeApi } from './useEarthquakeApi';
import { registerEarthquakeDataMapper } from './dataMapper';
import type { EarthquakeApiResponse } from './types';

const mockApiResponse: EarthquakeApiResponse = {
  type: 'FeatureCollection',
  metadata: {
    generated: 1234567890,
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    title: 'USGS Earthquakes',
    status: 200,
    api: '1.10.3',
    count: 1,
  },
  features: [
    {
      type: 'Feature',
      properties: {
        mag: 5.2,
        place: '100km S of Randomville',
        time: 1620000000000,
        updated: 1620000001000,
        tz: null,
        url: 'https://earthquake.usgs.gov/earthquakes/eventpage/abcd1234',
        detail: '',
        felt: null,
        cdi: null,
        mmi: null,
        alert: null,
        status: 'reviewed',
        tsunami: 0,
        sig: 416,
        net: 'us',
        code: 'abcd1234',
        ids: ',abcd1234,',
        sources: ',us,',
        types: ',origin,',
        nst: null,
        dmin: null,
        rms: null,
        gap: null,
        magType: 'mb',
        type: 'earthquake',
        title: 'M 5.2 - 100km S of Randomville',
      },
      geometry: {
        type: 'Point',
        coordinates: [140.123, 35.678, 10],
      },
      id: 'abcd1234',
    },
  ],
  bbox: [140.123, 35.678, 10, 140.123, 35.678, 10],
};

global.fetch = vi.fn();

describe('useEarthquakeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerEarthquakeDataMapper();
  });

  it('fetches and maps USGS earthquake data successfully', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });
    const { result } = renderHook(() => useEarthquakeApi());
    let data: Awaited<ReturnType<ReturnType<typeof useEarthquakeApi>["getEarthquakes"]>> | undefined;
    await act(async () => {
      data = await result.current.getEarthquakes('test-tile', {});
    });
    expect(data).toBeDefined();
    if (data) {
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].id).toBe('abcd1234');
      expect(data[0].place).toBe('100km S of Randomville');
      expect(data[0].magnitude).toBe(5.2);
      expect(data[0].coordinates).toEqual([140.123, 35.678, 10]);
    }
  });

  it('throws error if API returns not ok', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });
    const { result } = renderHook(() => useEarthquakeApi());
    await expect(result.current.getEarthquakes('test-tile', {})).rejects.toThrow('USGS API error');
  });

  it('throws error if fetch fails', async () => {
    (fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useEarthquakeApi());
    await expect(result.current.getEarthquakes('test-tile', {})).rejects.toThrow('Network error');
  });
}); 
