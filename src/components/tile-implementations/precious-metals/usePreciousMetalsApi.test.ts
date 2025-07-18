import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import './dataMapper';
import type { MetalsApiParams } from '../../../services/apiEndpoints';
import type { PreciousMetalsTileData } from './types';

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
    const { result } = renderHook(() => usePreciousMetalsApi());
    const fetchResult = await result.current.getPreciousMetals(mockTileId, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('lastUpdated');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult).toHaveProperty('isCached');
    expect(fetchResult).toHaveProperty('retryCount');
    
    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.gold?.price).toBe(2050.75);
    expect(data?.silver?.price).toBe(23.45);
  });
});
