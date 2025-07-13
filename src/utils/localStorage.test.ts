import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCachedData, setCachedData, clearExpiredData, getStorageUsage } from './localStorage';

// Mock localStorage with actual storage functionality
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) =>
    Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  ),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((index: number) => Object.keys(store)[index] || null),
};

describe('Local Storage Utilities', () => {
  let originalObjectKeys: typeof Object.keys;

  beforeEach(() => {
    // Replace the global localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    // Patch Object.keys(localStorage) to return the keys of the mock store
    originalObjectKeys = Object.keys;
    Object.keys = (obj: object) => {
      if (obj === localStorage) return Object.keys(store);
      return originalObjectKeys(obj);
    };
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    Object.keys = originalObjectKeys;
  });

  describe('setCachedData', () => {
    it('should store data with timestamp and expiration', () => {
      const testData = { price: 50000 };
      const key = 'test-key';

      setCachedData(key, testData);

      const stored = localStorage.getItem(key);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(testData);
      expect(parsed.timestamp).toBeTypeOf('number');
      expect(parsed.expiresAt).toBeTypeOf('number');
    });

    it('should handle storage errors gracefully', () => {
      const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const testData = { price: 50000 };

      expect(() => setCachedData('test-key', testData)).not.toThrow();

      mockSetItem.mockRestore();
    });
  });

  describe('getCachedData', () => {
    it('should return cached data if not expired', () => {
      const testData = { price: 50000 };
      const key = 'test-key';
      const now = Date.now();

      const cached = {
        data: testData,
        timestamp: now,
        expiresAt: now + 600000, // 10 minutes from now
      };

      localStorage.setItem(key, JSON.stringify(cached));

      const result = getCachedData(key);
      expect(result).toEqual(testData);
    });

    it('should return null for expired data', () => {
      const testData = { price: 50000 };
      const key = 'test-key';
      const now = Date.now();

      const cached = {
        data: testData,
        timestamp: now - 1200000, // 20 minutes ago
        expiresAt: now - 600000, // 10 minutes ago
      };

      localStorage.setItem(key, JSON.stringify(cached));

      const result = getCachedData(key);
      expect(result).toBeNull();
    });

    it('should return null for non-existent data', () => {
      const result = getCachedData('non-existent');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('invalid-key', 'invalid-json');

      const result = getCachedData('invalid-key');
      expect(result).toBeNull();
    });
  });

  describe('clearExpiredData', () => {
    it('should remove expired tile data', () => {
      const now = Date.now();

      // Add expired data
      const expiredData = {
        data: { price: 50000 },
        timestamp: now - 1200000,
        expiresAt: now - 600000,
      };
      localStorage.setItem('tile-data-expired', JSON.stringify(expiredData));

      // Add valid data
      const validData = {
        data: { price: 50000 },
        timestamp: now,
        expiresAt: now + 600000,
      };
      localStorage.setItem('tile-data-valid', JSON.stringify(validData));

      // Add non-tile data (should not be removed)
      localStorage.setItem('other-data', 'some-value');

      clearExpiredData();

      expect(localStorage.getItem('tile-data-expired')).toBeNull();
      expect(localStorage.getItem('tile-data-valid')).toBeTruthy();
      expect(localStorage.getItem('other-data')).toBeTruthy();
    });

    it('should handle storage errors gracefully', () => {
      const mockGetItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearExpiredData()).not.toThrow();

      mockGetItem.mockRestore();
    });
  });

  describe('getStorageUsage', () => {
    it('should calculate storage usage correctly', () => {
      const testData = { price: 50000 };
      localStorage.setItem('test-key', JSON.stringify(testData));
      // Manual calculation for mock
      const used = Object.values(store).reduce((acc, v) => acc + v.length, 0);
      const available = 5 * 1024 * 1024 - used;
      const usage = getStorageUsage();
      expect(usage.used).toBe(used);
      expect(usage.available).toBe(available);
      expect(usage.used + usage.available).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should handle storage errors gracefully', () => {
      const mockKeys = vi.spyOn(Object, 'keys').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const usage = getStorageUsage();
      expect(usage.used).toBe(0);
      expect(usage.available).toBe(0);

      mockKeys.mockRestore();
    });
  });
});
