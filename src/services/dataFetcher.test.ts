import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataFetcher } from './dataFetcher';
import { storageManager } from './storageManager';

// Mock fetch globally
global.fetch = vi.fn();

describe('DataFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear logs before each test
    storageManager.clearLogs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchWithRetry - Error Logging', () => {
    it('should log errors to api-log system when fetch fails', async () => {
      // Arrange
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Act
      const result = await DataFetcher.fetchWithRetry(() => fetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();

      // Check that error was logged
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        apiCall,
        reason: 'Network error',
        details: {
          storageKey,
          retryCount: 0,
          forceRefresh: 0,
          errorName: 'Error',
          errorMessage: 'Network error',
        },
      });
    });

    it('should log timeout errors to api-log system', async () => {
      // Arrange
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 100);
          }),
      );

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Act
      const result = await DataFetcher.fetchWithRetry(() => fetch('/api/test'), storageKey, {
        apiCall,
        timeout: 50,
      });

      // Assert
      expect(result.error).toBe('Request timeout');
      expect(result.data).toBeNull();

      // Check that error was logged
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        apiCall,
        reason: 'Request timeout',
      });
    });

    it('should use storageKey as default apiCall when not provided', async () => {
      // Arrange
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const storageKey = 'test-storage-key';

      // Act
      await DataFetcher.fetchWithRetry(() => fetch('/api/test'), storageKey);

      // Assert
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].apiCall).toBe(storageKey);
    });
  });

  describe('fetchWithBackgroundRefresh - Warning Logging', () => {
    it.skip('should log background refresh failures as warnings', async () => {
      // Arrange
      vi.useFakeTimers();
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: 'cached' }),
      } as Response);
      mockFetch.mockRejectedValueOnce(new Error('Background refresh failed'));

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Mock storage to return cached data
      storageManager.setTileState(storageKey, {
        data: { lastUpdated: '2024-01-01T00:00:00Z' },
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      });

      // Act
      const result = await DataFetcher.fetchWithBackgroundRefresh(
        () => fetch('/api/test'),
        storageKey,
        { apiCall },
      );

      // Assert
      expect(result.data).toEqual({ cached: 'data' });
      expect(result.isCached).toBe(true);

      // Fast-forward timers to trigger background refresh
      await vi.runAllTimersAsync();
      // Flush microtasks to ensure async log is written
      await Promise.resolve();
      await Promise.resolve();
      // Poll for log entry up to 500ms
      let logs = storageManager.getLogs();
      const start = Date.now();
      while (logs.length === 0 && Date.now() - start < 500) {
        await new Promise((r) => setTimeout(r, 10));
        logs = storageManager.getLogs();
      }

      // Check that warning was logged
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'warning',
        apiCall,
        reason: 'Background refresh failed: Background refresh failed',
      });
    });
  });

  describe('Helper Methods', () => {
    it('should log warnings using logWarning method', () => {
      // Arrange
      const apiCall = 'Test API';
      const reason = 'Test warning';
      const details = { test: 'data' };

      // Act
      DataFetcher.logWarning(apiCall, reason, details);

      // Assert
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'warning',
        apiCall,
        reason,
        details,
      });
    });

    it('should log errors using logError method', () => {
      // Arrange
      const apiCall = 'Test API';
      const reason = 'Test error';
      const details = { test: 'data' };

      // Act
      DataFetcher.logError(apiCall, reason, details);

      // Assert
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        apiCall,
        reason,
        details,
      });
    });
  });
});
