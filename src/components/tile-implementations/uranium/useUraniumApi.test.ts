import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUraniumApi } from './useUraniumApi';
import { registerUraniumDataParser } from './dataParser';
import { EndpointTestUtils } from '../../../test/utils/endpointTestUtils';
import type { UraniumParams } from '../../../services/apiEndpoints';

describe('useUraniumApi', () => {
  const mockTileId = 'test-uranium-tile';
  const mockParams: UraniumParams = {
    range: '1Y',
  };
  const mockHtml = '<span id="spot-price">85.5</span>';

  beforeEach(() => {
    registerUraniumDataParser();
    EndpointTestUtils.clearMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => mockHtml });
  });

  it('should successfully fetch uranium data (HTML scraping)', async () => {
    const { result } = renderHook(() => useUraniumApi());
    const data = await result.current.getUraniumPrice(mockTileId, mockParams);
    expect(data).toBeDefined();
    expect(data.spotPrice).toBe(85.5);
    expect(data.history).toEqual([]);
  });
});
