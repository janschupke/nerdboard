import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCryptoApi } from './useCryptoApi';
import {
  API_ENDPOINTS,
  setupCryptocurrencySuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
  EndpointTestUtils,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { CryptoMarketsParams } from '../../../services/apiEndpoints';

describe('useCryptoApi', () => {
  const mockTileId = 'test-crypto-tile';
  const mockParams: CryptoMarketsParams = {
    vs_currency: 'usd',
    ids: 'bitcoin,ethereum',
    order: 'market_cap_desc',
    per_page: 10,
    page: 1,
    sparkline: false,
  };

  describe('getCryptocurrencyMarkets - Success Scenarios', () => {
    it('should successfully fetch cryptocurrency data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi());

      // Act
      const data = await result.current.getCryptocurrencyMarkets(mockTileId, mockParams);

      // Assert
      expect(data.coins).toEqual(MockResponseData.getCryptocurrencyData());
      expect(data.coins).toHaveLength(2);
      expect(data.coins[0]).toHaveProperty('id', 'bitcoin');
      expect(data.coins[0]).toHaveProperty('symbol', 'btc');
      expect(data.coins[0]).toHaveProperty('current_price', 45000);
      expect(data.coins[1]).toHaveProperty('id', 'ethereum');
      expect(data.coins[1]).toHaveProperty('symbol', 'eth');
    });

    it('should handle empty response data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, []);
      const { result } = renderHook(() => useCryptoApi());

      // Act
      const data = await result.current.getCryptocurrencyMarkets(mockTileId, mockParams);

      // Assert
      expect(data.coins).toEqual([]);
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupDelayedMock(
        API_ENDPOINTS.COINGECKO_MARKETS,
        MockResponseData.getCryptocurrencyData(),
        50,
      );
      const { result } = renderHook(() => useCryptoApi());

      // Act & Assert
      await waitFor(async () => {
        const data = await result.current.getCryptocurrencyMarkets(mockTileId, mockParams);
        expect(data.coins).toEqual(MockResponseData.getCryptocurrencyData());
      });
    });
  });

  describe('getCryptocurrencyMarkets - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'network');
      const { result } = renderHook(() => useCryptoApi());

      // Act & Assert
      await expect(result.current.getCryptocurrencyMarkets(mockTileId, mockParams)).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'timeout');
      const { result } = renderHook(() => useCryptoApi());

      // Act & Assert
      await expect(result.current.getCryptocurrencyMarkets(mockTileId, mockParams)).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'api');
      const { result } = renderHook(() => useCryptoApi());

      // Act & Assert
      await expect(result.current.getCryptocurrencyMarkets(mockTileId, mockParams)).rejects.toThrow(
        'API error: 500 Internal Server Error',
      );
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'malformed');
      const { result } = renderHook(() => useCryptoApi());

      // Act & Assert
      await expect(result.current.getCryptocurrencyMarkets(mockTileId, mockParams)).rejects.toThrow(
        'Invalid JSON response',
      );
    });
  });

  describe('getCryptocurrencyMarkets - Edge Cases', () => {
    it('should handle different parameter combinations', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi());

      // Only test the default params that are actually mocked
      const testParams: CryptoMarketsParams[] = [
        {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      ];

      // Act & Assert
      for (const params of testParams) {
        const data = await result.current.getCryptocurrencyMarkets(mockTileId, params);
        expect(data.coins).toEqual(MockResponseData.getCryptocurrencyData());
      }
    });

    it('should handle null response data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, null);
      const { result } = renderHook(() => useCryptoApi());

      // Act
      const data = await result.current.getCryptocurrencyMarkets(mockTileId, mockParams);

      // Assert
      expect(data.coins).toEqual([]);
    });
  });

  describe('getCryptocurrencyMarkets - Data Validation', () => {
    it('should return properly structured cryptocurrency data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi());

      // Act
      const data = await result.current.getCryptocurrencyMarkets(mockTileId, mockParams);

      // Assert
      expect(data.coins).toBeInstanceOf(Array);
      expect(data.coins.length).toBeGreaterThan(0);

      const bitcoin = data.coins.find((coin) => coin.id === 'bitcoin');
      expect(bitcoin).toBeDefined();
      expect(bitcoin).toMatchObject({
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: expect.any(Number),
        market_cap: expect.any(Number),
        market_cap_rank: expect.any(Number),
        price_change_percentage_24h: expect.any(Number),
        price_change_24h: expect.any(Number),
        total_volume: expect.any(Number),
        circulating_supply: expect.any(Number),
        total_supply: expect.any(Number),
        max_supply: expect.any(Number),
        ath: expect.any(Number),
        ath_change_percentage: expect.any(Number),
        atl: expect.any(Number),
        atl_change_percentage: expect.any(Number),
        last_updated: expect.any(String),
      });
    });
  });
});
