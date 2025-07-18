import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEarthquakeApi } from './useEarthquakeApi';
import { earthquakeDataMapper } from './dataMapper';
import type { EarthquakeApiResponse } from './types';
import { storageManager } from '../../../services/storageManager';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { TileType } from '../../../types/tile';

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

beforeAll(() => {
  // registerEarthquakeDataMapper(); // This line is removed as per the new_code
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.EARTHQUAKE, earthquakeDataMapper);
    }}
  >
    {children}
  </MockDataServicesProvider>
);

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
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(typeof fetchResult.lastDataRequest).toBe('number');
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
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: false,
    });
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual([]);
    }
  });

  it('returns empty data and error if fetch fails', async () => {
    (globalThis.fetch as unknown as { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error('Network error'),
    );
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {});
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toEqual([]);
    }
  });
});
