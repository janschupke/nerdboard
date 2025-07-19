import { describe, it, expect, beforeAll } from 'vitest';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import { PreciousMetalsDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';
import type { GoldApiParams } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.PRECIOUS_METALS, new PreciousMetalsDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

beforeAll(() => {
  // registerPreciousMetalsDataMapper(); // This line is removed as per the edit hint
});

describe('usePreciousMetalsApi', () => {
  const mockTileId = 'test-precious-metals-tile';
  const mockParams: GoldApiParams = {
    currency: 'USD',
    unit: 'ounce',
  };

  it('should successfully fetch precious metals data', async () => {
    // Mock the precious metals endpoint response
    const mockResponse = {
      gold: {
        price: 3350.31,
        change_24h: 0,
        change_percentage_24h: 0,
      },
      silver: {
        price: 38.19,
        change_24h: 0,
        change_percentage_24h: 0,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({ 
      ok: true, 
      json: async () => mockResponse 
    });

    const { result } = renderHook(() => usePreciousMetalsApi(), { wrapper });
    const fetchResult = await result.current.getPreciousMetals(mockTileId, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('lastDataRequest');
    expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
    expect(typeof fetchResult.lastDataRequest).toBe('number');

    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.gold?.price).toBe(3350.31);
    expect(data?.silver?.price).toBe(38.19);
  });
});
