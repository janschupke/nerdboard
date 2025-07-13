import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sidebarStorage, type SidebarState } from './sidebarStorage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('sidebarStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('saveSidebarState', () => {
    it('should save valid state to localStorage', async () => {
      const state: SidebarState = {
        activeTiles: ['cryptocurrency', 'weather'],
        isCollapsed: false,
        lastUpdated: Date.now(),
      };

      await sidebarStorage.saveSidebarState(state);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nerdboard-sidebar-state',
        expect.stringContaining('"activeTiles":["cryptocurrency","weather"]')
      );
    });

    it('should throw error when localStorage fails', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const state: SidebarState = {
        activeTiles: ['cryptocurrency'],
        isCollapsed: false,
        lastUpdated: Date.now(),
      };

      await expect(sidebarStorage.saveSidebarState(state)).rejects.toThrow(
        'Failed to save sidebar preferences'
      );
    });
  });

  describe('loadSidebarState', () => {
    it('should load valid state from localStorage', async () => {
      const state: SidebarState = {
        activeTiles: ['cryptocurrency', 'weather'],
        isCollapsed: true,
        lastUpdated: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(state));

      const result = await sidebarStorage.loadSidebarState();

      expect(result).toEqual(state);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('nerdboard-sidebar-state');
    });

    it('should return null when no data exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await sidebarStorage.loadSidebarState();

      expect(result).toBeNull();
    });

    it('should return null when data is invalid', async () => {
      localStorageMock.getItem.mockReturnValue('{"invalid": "data"}');

      const result = await sidebarStorage.loadSidebarState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nerdboard-sidebar-state');
    });

    it('should return null when data is too old', async () => {
      const oldState: SidebarState = {
        activeTiles: ['cryptocurrency'],
        isCollapsed: false,
        lastUpdated: Date.now() - (31 * 24 * 60 * 60 * 1000), // 31 days old
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldState));

      const result = await sidebarStorage.loadSidebarState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nerdboard-sidebar-state');
    });

    it('should handle JSON parse errors', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = await sidebarStorage.loadSidebarState();

      expect(result).toBeNull();
    });
  });

  describe('clearSidebarState', () => {
    it('should remove data from localStorage', async () => {
      await sidebarStorage.clearSidebarState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nerdboard-sidebar-state');
    });

    it('should handle errors gracefully', async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      await expect(sidebarStorage.clearSidebarState()).resolves.toBeUndefined();
    });
  });

  describe('isValidState', () => {
    it('should validate correct state', () => {
      const validState: SidebarState = {
        activeTiles: ['cryptocurrency', 'weather'],
        isCollapsed: false,
        lastUpdated: Date.now(),
      };

      expect(sidebarStorage.isValidState(validState)).toBe(true);
    });

    it('should reject invalid state with wrong activeTiles type', () => {
      const invalidState = {
        activeTiles: 'not an array',
        isCollapsed: false,
        lastUpdated: Date.now(),
      };

      expect(sidebarStorage.isValidState(invalidState)).toBe(false);
    });

    it('should reject invalid state with wrong isCollapsed type', () => {
      const invalidState = {
        activeTiles: ['cryptocurrency'],
        isCollapsed: 'not a boolean',
        lastUpdated: Date.now(),
      };

      expect(sidebarStorage.isValidState(invalidState)).toBe(false);
    });

    it('should reject invalid state with wrong lastUpdated type', () => {
      const invalidState = {
        activeTiles: ['cryptocurrency'],
        isCollapsed: false,
        lastUpdated: 'not a number',
      };

      expect(sidebarStorage.isValidState(invalidState)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(sidebarStorage.isValidState(null)).toBe(false);
      expect(sidebarStorage.isValidState(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(sidebarStorage.isValidState('string')).toBe(false);
      expect(sidebarStorage.isValidState(123)).toBe(false);
      expect(sidebarStorage.isValidState(true)).toBe(false);
    });

    it('should reject state with missing properties', () => {
      const incompleteState = {
        activeTiles: ['cryptocurrency'],
        // missing isCollapsed and lastUpdated
      };

      expect(sidebarStorage.isValidState(incompleteState)).toBe(false);
    });

    it('should reject state with non-string tile IDs', () => {
      const invalidState = {
        activeTiles: ['cryptocurrency', 123, 'weather'],
        isCollapsed: false,
        lastUpdated: Date.now(),
      };

      expect(sidebarStorage.isValidState(invalidState)).toBe(false);
    });
  });
}); 
