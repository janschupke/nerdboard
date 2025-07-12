import { describe, it, expect } from 'vitest';
import {
  CRYPTO_API_CONFIG,
  CRYPTO_UI_CONFIG,
  CRYPTO_CHART_CONFIG,
  CRYPTO_ERROR_MESSAGES,
} from './constants';

describe('Cryptocurrency Tile Constants', () => {
  describe('CRYPTO_API_CONFIG', () => {
    it('should have correct base URL', () => {
      expect(CRYPTO_API_CONFIG.BASE_URL).toBe('/api/coingecko/api/v3');
    });

    it('should have correct cache duration', () => {
      expect(CRYPTO_API_CONFIG.CACHE_DURATION).toBe(30000); // 30 seconds
    });

    it('should have correct default limit', () => {
      expect(CRYPTO_API_CONFIG.DEFAULT_LIMIT).toBe(10);
    });

    it('should have correct default refresh interval', () => {
      expect(CRYPTO_API_CONFIG.DEFAULT_REFRESH_INTERVAL).toBe(30000); // 30 seconds
    });
  });

  describe('CRYPTO_UI_CONFIG', () => {
    it('should have correct chart heights', () => {
      expect(CRYPTO_UI_CONFIG.CHART_HEIGHTS.LARGE).toBe(300);
      expect(CRYPTO_UI_CONFIG.CHART_HEIGHTS.MEDIUM).toBe(200);
      expect(CRYPTO_UI_CONFIG.CHART_HEIGHTS.SMALL).toBe(150);
    });

    it('should have correct chart periods', () => {
      expect(CRYPTO_UI_CONFIG.CHART_PERIODS).toEqual(['7d', '30d', '1y']);
    });

    it('should have correct default chart period', () => {
      expect(CRYPTO_UI_CONFIG.DEFAULT_CHART_PERIOD).toBe('7d');
    });

    it('should have correct top coins display limit', () => {
      expect(CRYPTO_UI_CONFIG.TOP_COINS_DISPLAY_LIMIT).toBe(10);
    });
  });

  describe('CRYPTO_CHART_CONFIG', () => {
    it('should have correct colors', () => {
      expect(CRYPTO_CHART_CONFIG.COLORS.PRIMARY).toBe('#3B82F6');
      expect(CRYPTO_CHART_CONFIG.COLORS.SECONDARY).toBe('#1E40AF');
    });

    it('should have correct styles', () => {
      expect(CRYPTO_CHART_CONFIG.STYLES.STROKE_WIDTH).toBe(2);
      expect(CRYPTO_CHART_CONFIG.STYLES.ACTIVE_DOT_RADIUS).toBe(4);
      expect(CRYPTO_CHART_CONFIG.STYLES.FONT_SIZE).toBe(10);
    });
  });

  describe('CRYPTO_ERROR_MESSAGES', () => {
    it('should have correct error messages', () => {
      expect(CRYPTO_ERROR_MESSAGES.FETCH_FAILED).toBe('Failed to load cryptocurrency data');
      expect(CRYPTO_ERROR_MESSAGES.API_ERROR).toBe('API request failed');
      expect(CRYPTO_ERROR_MESSAGES.NETWORK_ERROR).toBe('Network error occurred');
    });
  });
});
