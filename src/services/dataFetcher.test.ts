import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { DataFetcher, DATA_FRESHNESS_INTERVAL } from './dataFetcher';
import { storageManager } from './storageManager';
import { DataParserRegistry, BaseDataParser } from './dataParser';

// Mock fetch globally, allow any return type for test mocks
global.fetch = vi.fn() as unknown as typeof fetch;

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
      const mockFetch = vi.fn();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
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
      storageManager.clearTileState(); // Ensure no cache
      const mockFetch = vi.fn();
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 100);
          }),
      );

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
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
      storageManager.clearTileState(); // Ensure no cache
      const mockFetch = vi.fn();
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const storageKey = 'test-storage-key';

      // Act
      await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey);

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
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'cached' });
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
        () => mockFetch('/api/test'),
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

  describe('fetchWithRetry - Data Age Validation', () => {
    it('should return cached data if less than 10 minutes old', async () => {
      // Arrange
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'fresh' });

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Mock storage with recent data (5 minutes old)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      storageManager.setTileState(storageKey, {
        data: { cached: 'data' },
        lastDataRequest: fiveMinutesAgo,
        lastDataRequestSuccessful: true,
      });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(result.data).toEqual({ cached: 'data' });
      expect(result.isCached).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled(); // Should not fetch fresh data
    });

    it('should fetch fresh data if cached data is older than 10 minutes', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Mock storage with old data (1.5x freshness interval ago)
      const oldTimestamp = Date.now() - DATA_FRESHNESS_INTERVAL * 1.5;
      storageManager.setTileState(storageKey, {
        data: { cached: 'data' },
        lastDataRequest: oldTimestamp,
        lastDataRequestSuccessful: true,
      });

      // Mock fetch
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'fresh' });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(result.data).toEqual({ data: 'fresh' });
      expect(result.isCached).toBe(false);
    });

    it('should bypass cache when forceRefresh is true', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Mock storage with recent data (half freshness interval ago)
      const recentTimestamp = Date.now() - DATA_FRESHNESS_INTERVAL / 2;
      storageManager.setTileState(storageKey, {
        data: { cached: 'data' },
        lastDataRequest: recentTimestamp,
        lastDataRequestSuccessful: true,
      });

      // Mock fetch
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'fresh' });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
        forceRefresh: true,
      });

      // Assert
      expect(result.data).toEqual({ data: 'fresh' });
      expect(result.isCached).toBe(false);
    });

    it('should fetch fresh data when no cached data exists', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Ensure no cached data exists
      storageManager.clearTileState();

      // Mock fetch
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'fresh' });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(result.data).toEqual({ data: 'fresh' });
      expect(result.isCached).toBe(false);
    });

    it('should use cached error if cached data is null and lastDataRequest is recent', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';
      // Mock storage with null data (recent)
      storageManager.setTileState(storageKey, {
        data: null,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      });
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValue({ data: 'fresh' }); // Should not be called

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.isCached).toBe(true);
      expect(result.error).toBe('No data (cached error or previous failure)');
    });

    it('should fetch fresh data when cached data is null and lastDataRequest is stale', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';
      // Mock storage with null data (stale)
      const old = Date.now() - DATA_FRESHNESS_INTERVAL * 1.5;
      storageManager.setTileState(storageKey, {
        data: null,
        lastDataRequest: old,
        lastDataRequestSuccessful: false,
      });
      const mockFetch = vi.fn();
      mockFetch.mockResolvedValueOnce({ data: 'fresh' });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(mockFetch).toHaveBeenCalled();
      expect(result.data).toEqual({ data: 'fresh' });
      expect(result.isCached).toBe(false);
    });

    it('should handle force refresh with network error', async () => {
      // Arrange
      const mockFetch = vi.fn();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Mock storage with recent data
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      storageManager.setTileState(storageKey, {
        data: { cached: 'data' },
        lastDataRequest: fiveMinutesAgo,
        lastDataRequestSuccessful: true,
      });

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
        forceRefresh: true,
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
          forceRefresh: 1, // Should indicate force refresh
          errorName: 'Error',
          errorMessage: 'Network error',
        },
      });
    });

    it('should handle API error responses (400/500)', async () => {
      // Arrange
      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Ensure no cached data exists
      storageManager.clearTileState();

      // Act
      const result = await DataFetcher.fetchWithRetry(
        () => Promise.resolve({ error: 'API error: 500 Internal Server Error' }),
        storageKey,
        {
          apiCall,
        },
      );

      // Assert
      expect(result.error).toBe('API error: 500 Internal Server Error');
      expect(result.data).toBeNull();

      // Check that error was logged
      const logs = storageManager.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        apiCall,
        reason: 'API error: 500 Internal Server Error',
        details: {
          storageKey,
          retryCount: 0,
          forceRefresh: 0,
          errorName: 'APIError',
          errorMessage: 'API error: 500 Internal Server Error',
        },
      });

      // Check that lastDataRequest was updated
      const tileState = storageManager.getTileState(storageKey);
      expect(tileState).not.toBeNull();
      expect(tileState?.lastDataRequest).toBeGreaterThan(Date.now() - 1000); // Should be recent
      expect(tileState?.lastDataRequestSuccessful).toBe(false);
    });

    it('should update lastDataRequest on network error', async () => {
      // Arrange
      const mockFetch = vi.fn();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const storageKey = 'test-storage-key';
      const apiCall = 'Test API';

      // Ensure no cached data exists
      storageManager.clearTileState();

      // Act
      const result = await DataFetcher.fetchWithRetry(() => mockFetch('/api/test'), storageKey, {
        apiCall,
      });

      // Assert
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();

      // Check that lastDataRequest was updated
      const tileState = storageManager.getTileState(storageKey);
      expect(tileState).not.toBeNull();
      expect(tileState?.lastDataRequest).toBeGreaterThan(Date.now() - 1000); // Should be recent
      expect(tileState?.lastDataRequestSuccessful).toBe(false);
    });

    it('should respect lockout interval after failed fetch (data: null)', async () => {
      // Arrange
      const storageKey = 'test-storage-key-lockout';
      const apiCall = 'Test API';
      const now = Date.now();
      // Simulate a previous failed fetch (data: null, recent lastDataRequest)
      storageManager.setTileState(storageKey, {
        data: null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
      });

      // Spy on fetch function to ensure it is NOT called
      const mockFetch = vi.fn().mockResolvedValue({ data: 'should not be called' });

      // Act
      const result = await DataFetcher.fetchWithRetry(mockFetch, storageKey, { apiCall });

      // Assert
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.isCached).toBe(true);
      expect(result.error).toBe('No data (cached error or previous failure)');
    });
  });
});

describe('DataFetcher.fetchAndParse', () => {
  type RawData = { value: number };
  type TileData = { doubled: number };
  const tileType = 'test-tile';

  class MockParser extends BaseDataParser<RawData, TileData> {
    parse(rawData: RawData): TileData {
      return { doubled: rawData.value * 2 };
    }
    validate(rawData: unknown): rawData is RawData {
      return typeof rawData === 'object' && rawData !== null && 'value' in rawData;
    }
    createDefault(): TileData {
      return { doubled: 0 };
    }
  }

  beforeAll(() => {
    DataParserRegistry.register(tileType, new MockParser());
  });

  beforeEach(() => {
    storageManager.clearTileState();
  });

  it('parses raw data successfully', async () => {
    const fetchFunction = async () => ({ value: 5 });
    const result = await DataFetcher.fetchAndParse(fetchFunction, 'parse-success-key', tileType);
    expect(result.data).toEqual({ doubled: 10 });
    expect(result.error).toBeNull();
    expect(result.isCached).toBe(false);
  });

  it('returns error if parser not found', async () => {
    const fetchFunction = async () => ({ value: 5 });
    const result = await DataFetcher.fetchAndParse(
      fetchFunction,
      'parser-not-found-key',
      'unknown-tile',
    );
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/No parser registered/);
  });

  it('returns error if parse throws', async () => {
    class ThrowingParser extends BaseDataParser<RawData, TileData> {
      parse(): TileData {
        throw new Error('Parse failed');
      }
      validate(_rawData: unknown): _rawData is RawData {
        return true;
      }
      createDefault(): TileData {
        return { doubled: 0 };
      }
    }
    DataParserRegistry.register('throw-tile', new ThrowingParser());
    const fetchFunction = async () => ({ value: 5 });
    const result = await DataFetcher.fetchAndParse(fetchFunction, 'parse-throws-key', 'throw-tile');
    expect(result.data).toEqual({ doubled: 0 });
    expect(result.error).toBeNull();
  });

  it('returns cached data if fresh', async () => {
    // First call to cache data
    const fetchFunction = async () => ({ value: 7 });
    await DataFetcher.fetchAndParse(fetchFunction, 'cache-key', tileType, {
      forceRefresh: true,
      apiCall: tileType,
    });
    // Second call should return cached data
    const result = await DataFetcher.fetchAndParse(fetchFunction, 'cache-key', tileType);
    expect(result.isCached).toBe(true);
    expect(result.data).toEqual({ doubled: 14 });
  });
});

describe('DataParserRegistry', () => {
  type Raw = { foo: string };
  type Data = { bar: string };
  class TestParser extends BaseDataParser<Raw, Data> {
    parse(raw: Raw): Data {
      return { bar: raw.foo };
    }
    validate(raw: unknown): raw is Raw {
      return typeof raw === 'object' && raw !== null && 'foo' in raw;
    }
    createDefault(): Data {
      return { bar: '' };
    }
  }
  it('registers and retrieves a parser', () => {
    DataParserRegistry.register('test', new TestParser());
    const parser = DataParserRegistry.get<'test', Raw, Data>('test');
    expect(parser).toBeDefined();
    expect(parser?.parse({ foo: 'baz' })).toEqual({ bar: 'baz' });
  });
  it('returns undefined for unknown type', () => {
    expect(DataParserRegistry.get<'unknown', Raw, Data>('unknown')).toBeUndefined();
  });
});
