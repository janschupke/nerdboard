import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFetcher } from './dataFetcher';
import { storageManager } from './storageManager';
import { DataParserRegistry, BaseDataParser } from './dataParser';
import { DataMapperRegistry } from './dataMapper';

// Mock fetch globally, allow any return type for test mocks
global.fetch = vi.fn() as unknown as typeof fetch;

// Only keep tests for fetchAndParse and DataParserRegistry

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

  let parserRegistry: DataParserRegistry;
  let mapperRegistry: DataMapperRegistry;
  let fetcher: DataFetcher;

  beforeEach(() => {
    storageManager.clearTileState();
    parserRegistry = new DataParserRegistry();
    mapperRegistry = new DataMapperRegistry();
    fetcher = new DataFetcher(mapperRegistry, parserRegistry);
    parserRegistry.register(tileType, new MockParser());
    parserRegistry.register('throw-tile', new ThrowingParser());
  });

  it('parses raw data successfully', async () => {
    const fetchFunction = async () => ({ value: 5 });
    const result = await fetcher.fetchAndParse(fetchFunction, 'parse-success-key', tileType);
    expect(result.data).toEqual({ doubled: 10 });
    // No error or isCached fields anymore
    expect(result.lastDataRequestSuccessful).toBe(true);
  });

  it('returns error if parser not found', async () => {
    const fetchFunction = async () => ({ value: 5 });
    await expect(
      fetcher.fetchAndParse(fetchFunction, 'parser-not-found-key', 'unknown-tile'),
    ).rejects.toThrow(/No parser registered/);
  });

  it('returns error if parse throws', async () => {
    const fetchFunction = async () => ({ value: 5 });
    const result = await fetcher.fetchAndParse(fetchFunction, 'parse-throws-key', 'throw-tile');
    expect(result.data).toEqual({ doubled: 0 });
    expect(result.lastDataRequestSuccessful).toBe(true); // safeParse returns default, so this is true
  });

  it('returns cached data if fresh', async () => {
    // First call to cache data
    const fetchFunction = async () => ({ value: 7 });
    await fetcher.fetchAndParse(fetchFunction, 'cache-key', tileType, {
      forceRefresh: true,
      apiCall: tileType,
    });
    // Second call should return cached data
    const result = await fetcher.fetchAndParse(fetchFunction, 'cache-key', tileType);
    expect(result.data).toEqual({ doubled: 14 });
    expect(result.lastDataRequestSuccessful).toBe(true);
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
    const registry = new DataParserRegistry();
    registry.register('test', new TestParser());
    const parser = registry.get<'test', Raw, Data>('test');
    expect(parser).toBeDefined();
    expect(parser?.parse({ foo: 'baz' })).toEqual({ bar: 'baz' });
  });
  it('returns undefined for unknown type', () => {
    const registry = new DataParserRegistry();
    expect(registry.get<'unknown', Raw, Data>('unknown')).toBeUndefined();
  });
});
