import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTyphoonApi } from './useTyphoonApi';
import './dataMapper'; // Ensure the dataMapper is registered
import type { TyphoonTileData } from './types';
import { vi } from 'vitest';

const mockApiResponse = {
  success: 'true',
  result: { resource_id: 'id', fields: [] },
  records: {
    datasetDescription: 'desc',
    location: [
      {
        locationName: 'Typhoon A',
        geocode: [],
        weatherElement: [
          {
            elementName: 'TyphoonCategory',
            description: '',
            time: [
              {
                startTime: '2024-06-10T00:00:00Z',
                endTime: '',
                parameter: [
                  { parameterName: 'Category', parameterValue: 'Severe', parameterUnit: '' },
                ],
              },
            ],
          },
          {
            elementName: 'TyphoonPosition',
            description: '',
            time: [
              {
                startTime: '2024-06-10T00:00:00Z',
                endTime: '',
                parameter: [
                  { parameterName: 'Latitude', parameterValue: '23.5', parameterUnit: '' },
                  { parameterName: 'Longitude', parameterValue: '120.5', parameterUnit: '' },
                ],
              },
            ],
          },
          {
            elementName: 'TyphoonForecast',
            description: '',
            time: [
              {
                startTime: '2024-06-11T00:00:00Z',
                endTime: '',
                parameter: [
                  { parameterName: 'Latitude', parameterValue: '24.0', parameterUnit: '' },
                  { parameterName: 'Longitude', parameterValue: '121.0', parameterUnit: '' },
                  { parameterName: 'WindSpeed', parameterValue: '80', parameterUnit: 'km/h' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

global.fetch = vi.fn();

describe('useTyphoonApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and maps Typhoon data successfully', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });
    const { result } = renderHook(() => useTyphoonApi());
    let data: TyphoonTileData = { typhoons: [], lastUpdated: '' };
    await act(async () => {
      data = await result.current.getTyphoonData('test-tile', 'test-key');
    });
    expect(data).toBeDefined();
    if (data) {
      expect(data.typhoons.length).toBe(1);
      expect(data.typhoons[0].name).toBe('Typhoon A');
      expect(data.typhoons[0].category).toBe('Severe');
      expect(data.typhoons[0].position.lat).toBeCloseTo(23.5);
      expect(data.typhoons[0].position.lon).toBeCloseTo(120.5);
      expect(data.typhoons[0].forecast.length).toBe(1);
      expect(data.typhoons[0].forecast[0].windSpeed).toBe(80);
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    (globalThis.fetch as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({
      ok: false,
    });
    const { result } = renderHook(() => useTyphoonApi());
    let data: TyphoonTileData = { typhoons: [], lastUpdated: '' };
    await act(async () => {
      data = await result.current.getTyphoonData('test-tile', 'test-key');
    });
    expect(data).toEqual({ typhoons: [], lastUpdated: '' });
  });

  it('returns empty data and error if fetch fails', async () => {
    (globalThis.fetch as unknown as { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error('Network error'),
    );
    const { result } = renderHook(() => useTyphoonApi());
    let data: TyphoonTileData = { typhoons: [], lastUpdated: '' };
    await act(async () => {
      data = await result.current.getTyphoonData('test-tile', 'test-key');
    });
    expect(data).toEqual({ typhoons: [], lastUpdated: '' });
  });
});
