import { describe, it, expect, beforeAll } from 'vitest';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import { PreciousMetalsDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';
import type { MetalsApiParams } from '../../../services/apiEndpoints';
import type { PreciousMetalsTileData } from './types';
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
  const mockParams: MetalsApiParams = {
    access_key: 'demo',
    base: 'USD',
    symbols: 'XAU,XAG',
  };
  const mockApiResponse: PreciousMetalsTileData = {
    gold: { price: 2050.75, change_24h: 10, change_percentage_24h: 0.5 },
    silver: { price: 23.45, change_24h: 0.2, change_percentage_24h: 0.8 },
  };

  it('should successfully fetch precious metals data', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockApiResponse });
    const { result } = renderHook(() => usePreciousMetalsApi(), { wrapper });
    const fetchResult = await result.current.getPreciousMetals(mockTileId, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('lastDataRequest');
    expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
    expect(typeof fetchResult.lastDataRequest).toBe('number');

    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.gold?.price).toBe(2050.75);
    expect(data?.silver?.price).toBe(23.45);
  });
});
