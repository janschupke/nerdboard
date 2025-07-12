import { describe, it, expect } from 'vitest';
import { 
  API_CONFIG, 
  UI_CONFIG, 
  ERROR_MESSAGES, 
  TIME_CONSTANTS, 
  CACHE_CONFIG 
} from './constants';

describe('Constants', () => {
  describe('API_CONFIG', () => {
    it('should have correct default timeout', () => {
      expect(API_CONFIG.DEFAULT_TIMEOUT).toBe(10000);
    });

    it('should have correct max retries', () => {
      expect(API_CONFIG.MAX_RETRIES).toBe(3);
    });

    it('should have correct retry delay', () => {
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
    });
  });

  describe('UI_CONFIG', () => {
    it('should have correct animation duration', () => {
      expect(UI_CONFIG.ANIMATION_DURATION).toBe(200);
    });

    it('should have correct transition duration', () => {
      expect(UI_CONFIG.TRANSITION_DURATION).toBe(300);
    });

    it('should have correct focus ring offset', () => {
      expect(UI_CONFIG.FOCUS_RING_OFFSET).toBe(2);
    });

    it('should have correct border radius values', () => {
      expect(UI_CONFIG.BORDER_RADIUS.SM).toBe(4);
      expect(UI_CONFIG.BORDER_RADIUS.MD).toBe(8);
      expect(UI_CONFIG.BORDER_RADIUS.LG).toBe(12);
    });

    it('should have correct spacing values', () => {
      expect(UI_CONFIG.SPACING.XS).toBe(4);
      expect(UI_CONFIG.SPACING.SM).toBe(8);
      expect(UI_CONFIG.SPACING.MD).toBe(16);
      expect(UI_CONFIG.SPACING.LG).toBe(24);
      expect(UI_CONFIG.SPACING.XL).toBe(32);
    });

    it('should have correct font sizes', () => {
      expect(UI_CONFIG.FONT_SIZES.XS).toBe(12);
      expect(UI_CONFIG.FONT_SIZES.SM).toBe(14);
      expect(UI_CONFIG.FONT_SIZES.MD).toBe(16);
      expect(UI_CONFIG.FONT_SIZES.LG).toBe(18);
      expect(UI_CONFIG.FONT_SIZES.XL).toBe(20);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Network error occurred');
      expect(ERROR_MESSAGES.TIMEOUT_ERROR).toBe('Request timed out');
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBe('An unknown error occurred');
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBe('Invalid data provided');
    });
  });

  describe('TIME_CONSTANTS', () => {
    it('should have correct time conversion values', () => {
      expect(TIME_CONSTANTS.MILLISECONDS_PER_SECOND).toBe(1000);
      expect(TIME_CONSTANTS.SECONDS_PER_MINUTE).toBe(60);
      expect(TIME_CONSTANTS.MINUTES_PER_HOUR).toBe(60);
      expect(TIME_CONSTANTS.HOURS_PER_DAY).toBe(24);
      expect(TIME_CONSTANTS.DAYS_PER_WEEK).toBe(7);
      expect(TIME_CONSTANTS.DAYS_PER_MONTH).toBe(30);
      expect(TIME_CONSTANTS.DAYS_PER_YEAR).toBe(365);
    });
  });

  describe('CACHE_CONFIG', () => {
    it('should have correct cache TTL values', () => {
      expect(CACHE_CONFIG.DEFAULT_TTL).toBe(300000); // 5 minutes
      expect(CACHE_CONFIG.SHORT_TTL).toBe(30000); // 30 seconds
      expect(CACHE_CONFIG.LONG_TTL).toBe(1800000); // 30 minutes
    });
  });
}); 
