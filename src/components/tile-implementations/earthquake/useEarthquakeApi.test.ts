import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEarthquakeApi } from './useEarthquakeApi';
import './dataMapper';
import type { EarthquakeApiResponse, EarthquakeTileData } from './types';
import type { FetchResult } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';

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
    storageManager.clearTileState(); // Clear cache between tests
  });

  it('fetches and maps USGS earthquake data successfully', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });
    const { result } = renderHook(() => useEarthquakeApi());
    let fetchResult!: FetchResult<EarthquakeTileData[]>;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('lastUpdated');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult).toHaveProperty('isCached');
    expect(fetchResult).toHaveProperty('retryCount');
    
    const data = fetchResult.data;
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

  it('returns empty data and error if API returns not ok', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: false,
    });
    const { result } = renderHook(() => useEarthquakeApi());
    let fetchResult!: FetchResult<EarthquakeTileData[]>;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult.status).toBe('error');
  });

  it('returns empty data and error if fetch fails', async () => {
    (globalThis.fetch as unknown as { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error('Network error'),
    );
    const { result } = renderHook(() => useEarthquakeApi());
    let fetchResult!: FetchResult<EarthquakeTileData[]>;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult.status).toBe('error');
  });
});
