import { describe, it, expect } from 'vitest';
import {
  PRECIOUS_METALS_API_CONFIG,
  PRECIOUS_METALS_UI_CONFIG,
  PRECIOUS_METALS_CHART_CONFIG,
  PRECIOUS_METALS_MOCK_CONFIG,
  PRECIOUS_METALS_ERROR_MESSAGES,
} from './constants';

describe('Precious Metals Tile Constants', () => {
  describe('PRECIOUS_METALS_API_CONFIG', () => {
    it('should have correct cache duration', () => {
      expect(PRECIOUS_METALS_API_CONFIG.CACHE_DURATION).toBe(300000); // 5 minutes
    });

    it('should have correct default refresh interval', () => {
      expect(PRECIOUS_METALS_API_CONFIG.DEFAULT_REFRESH_INTERVAL).toBe(300000); // 5 minutes
    });
  });

  describe('PRECIOUS_METALS_UI_CONFIG', () => {
    it('should have correct chart heights', () => {
      expect(PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.LARGE).toBe(300);
      expect(PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.MEDIUM).toBe(200);
      expect(PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.SMALL).toBe(150);
    });

    it('should have correct chart periods', () => {
      expect(PRECIOUS_METALS_UI_CONFIG.CHART_PERIODS).toEqual(['7d', '30d', '1y']);
    });

    it('should have correct default chart period', () => {
      expect(PRECIOUS_METALS_UI_CONFIG.DEFAULT_CHART_PERIOD).toBe('7d');
    });

    it('should have correct available metals', () => {
      expect(PRECIOUS_METALS_UI_CONFIG.AVAILABLE_METALS).toEqual(['gold', 'silver']);
    });

    it('should have correct default metal', () => {
      expect(PRECIOUS_METALS_UI_CONFIG.DEFAULT_METAL).toBe('gold');
    });
  });

  describe('PRECIOUS_METALS_CHART_CONFIG', () => {
    it('should have correct colors', () => {
      expect(PRECIOUS_METALS_CHART_CONFIG.COLORS.GOLD).toBe('#FFD700');
      expect(PRECIOUS_METALS_CHART_CONFIG.COLORS.SILVER).toBe('#C0C0C0');
    });

    it('should have correct styles', () => {
      expect(PRECIOUS_METALS_CHART_CONFIG.STYLES.STROKE_WIDTH).toBe(2);
      expect(PRECIOUS_METALS_CHART_CONFIG.STYLES.ACTIVE_DOT_RADIUS).toBe(4);
      expect(PRECIOUS_METALS_CHART_CONFIG.STYLES.FONT_SIZE).toBe(10);
    });
  });

  describe('PRECIOUS_METALS_MOCK_CONFIG', () => {
    it('should have correct gold configuration', () => {
      expect(PRECIOUS_METALS_MOCK_CONFIG.GOLD.BASE_PRICE).toBe(1950.5);
      expect(PRECIOUS_METALS_MOCK_CONFIG.GOLD.CHANGE_24H).toBe(12.3);
      expect(PRECIOUS_METALS_MOCK_CONFIG.GOLD.CHANGE_PERCENTAGE_24H).toBe(0.63);
      expect(PRECIOUS_METALS_MOCK_CONFIG.GOLD.VOLATILITY).toBe(50);
    });

    it('should have correct silver configuration', () => {
      expect(PRECIOUS_METALS_MOCK_CONFIG.SILVER.BASE_PRICE).toBe(24.75);
      expect(PRECIOUS_METALS_MOCK_CONFIG.SILVER.CHANGE_24H).toBe(-0.15);
      expect(PRECIOUS_METALS_MOCK_CONFIG.SILVER.CHANGE_PERCENTAGE_24H).toBe(-0.6);
      expect(PRECIOUS_METALS_MOCK_CONFIG.SILVER.VOLATILITY).toBe(2);
    });

    it('should have correct time constants', () => {
      expect(PRECIOUS_METALS_MOCK_CONFIG.TIME_CONSTANTS.DAY_MS).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('PRECIOUS_METALS_ERROR_MESSAGES', () => {
    it('should have correct error messages', () => {
      expect(PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED).toBe(
        'Failed to load precious metals data',
      );
      expect(PRECIOUS_METALS_ERROR_MESSAGES.NO_DATA_AVAILABLE).toBe('No data available');
    });
  });
});
