import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUraniumApi } from './useUraniumApi';
import { registerUraniumDataParser } from './dataParser';
import { EndpointTestUtils } from '../../../test/utils/endpointTestUtils';
import type { UraniumHtmlParams } from '../../../services/apiEndpoints';
import type { UraniumTileData } from './types';

describe('useUraniumApi', () => {
  const mockTileId = 'test-uranium-tile';
  const mockParams: UraniumHtmlParams = {
    range: '1Y',
  };
  const mockHtml = '<span id="spot-price">85.5</span>';
  const expectedData: UraniumTileData = {
    spotPrice: 85.5,
    change: 0,
    changePercent: 0,
    lastUpdated: expect.any(String),
    history: [],
  };

  beforeEach(() => {
    registerUraniumDataParser();
    EndpointTestUtils.clearMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => mockHtml });
  });

  it('should successfully fetch uranium data (HTML scraping)', async () => {
    const { result } = renderHook(() => useUraniumApi());
    const fetchResult = await result.current.getUraniumPrice(mockTileId, mockParams);
    expect(fetchResult).toBeDefined();
    expect(fetchResult).toHaveProperty('data');
    expect(fetchResult).toHaveProperty('status');
    expect(fetchResult).toHaveProperty('lastUpdated');
    expect(fetchResult).toHaveProperty('error');
    expect(fetchResult).toHaveProperty('isCached');
    expect(fetchResult).toHaveProperty('retryCount');
    
    const data = fetchResult.data;
    expect(data).toBeDefined();
    expect(data?.spotPrice).toBe(expectedData.spotPrice);
    expect(data?.history).toEqual(expectedData.history);
  });
});
