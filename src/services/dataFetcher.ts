import {
  APILogLevel,
  storageManager,
  type APILogDetails,
  type TileDataType,
  type TileConfig,
} from './storageManager';
import { type BaseApiResponse, DataMapperRegistry } from './dataMapper';
import { DataParserRegistry } from './dataParser';
// tileDataMappers and tileDataParsers will be replaced by injected registries

export const DATA_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface FetchOptions {
  forceRefresh?: boolean;
  apiCall: string;
}

export class DataFetcher {
  private mapperRegistry: DataMapperRegistry;
  private parserRegistry: DataParserRegistry;

  constructor(mapperRegistry: DataMapperRegistry, parserRegistry: DataParserRegistry) {
    this.mapperRegistry = mapperRegistry;
    this.parserRegistry = parserRegistry;
  }

  // Centralized helper for setting tile state
  private setTileState<T extends TileDataType>(
    storageKey: string,
    data: T | null,
    lastDataRequestSuccessful: boolean,
  ) {
    storageManager.setTileState<T>(storageKey, {
      data,
      lastDataRequest: Date.now(),
      lastDataRequestSuccessful,
    });
  }

  async fetchAndMap<
    TTileType extends string,
    TApiResponse extends BaseApiResponse | BaseApiResponse[],
    TTileData extends TileDataType,
  >(
    fetchFunction: () => Promise<TApiResponse>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
  ): Promise<TileConfig<TTileData>> {
    const { forceRefresh = false, apiCall = tileType } = options;
    const cached = storageManager.getTileState<TTileData>(storageKey);
    const now = Date.now();
    const isFresh = cached && now - cached.lastDataRequest < DATA_REFRESH_INTERVAL;

    if (!forceRefresh && cached && isFresh) {
      return {
        data: cached.data,
        lastDataRequest: cached.lastDataRequest,
        lastDataRequestSuccessful: cached.lastDataRequestSuccessful,
      };
    }

    const mapper = this.mapperRegistry.get<TTileType, TApiResponse, TTileData>(tileType);
    if (!mapper) {
      throw new Error(`No data mapper found for tile type: ${tileType}`);
    }

    try {
      const apiResponse = await fetchFunction();
      // If the API response contains an 'error' property, treat as error

      if (apiResponse && typeof apiResponse === 'object' && 'error' in apiResponse) {
        throw new Error(((apiResponse as Record<string, unknown>).error as string) || 'API error');
      }
      const mappedData = mapper.safeMap(apiResponse) as unknown as TTileData;
      // On success, update data and status
      this.setTileState<TTileData>(storageKey, mappedData, true);
      return {
        data: mappedData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      };
    } catch (error) {
      // Log error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logDetails: APILogDetails = {
        storageKey,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });
      // On error, update only lastDataRequest and lastDataRequestSuccessful, do not update data
      const cached = storageManager.getTileState<TTileData>(storageKey);
      const prevData =
        cached && cached.data ? cached.data : (mapper.createDefault() as unknown as TTileData);
      this.setTileState<TTileData>(storageKey, prevData, false);
      return {
        data: prevData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      };
    }
  }

  async fetchAndParse<TTileType extends string, TRawData, TTileData extends TileDataType>(
    fetchFunction: () => Promise<TRawData>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
  ): Promise<TileConfig<TTileData>> {
    const { forceRefresh = false, apiCall = tileType } = options;
    const cached = storageManager.getTileState<TTileData>(storageKey);
    const now = Date.now();
    const isFresh = cached && now - cached.lastDataRequest < DATA_REFRESH_INTERVAL;

    if (!forceRefresh && cached && isFresh) {
      return {
        data: cached.data,
        lastDataRequest: cached.lastDataRequest,
        lastDataRequestSuccessful: cached.lastDataRequestSuccessful,
      };
    }

    const parser = this.parserRegistry.get<TTileType, TRawData, TTileData>(tileType);
    if (!parser) {
      throw new Error(`No parser registered for tile type: ${tileType}`);
    }

    try {
      const rawData = await fetchFunction();
      let tileData: TTileData;
      try {
        tileData = parser.safeParse(rawData) as unknown as TTileData;
      } catch (parseError) {
        // If parser.safeParse throws, treat as error
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        const logDetails: APILogDetails = {
          storageKey,
          errorName: parseError instanceof Error ? parseError.name : 'Unknown',
          errorMessage,
        };
        storageManager.addLog({
          level: APILogLevel.ERROR,
          apiCall,
          reason: errorMessage,
          details: logDetails,
        });
        const prevData = parser.createDefault() as unknown as TTileData;
        this.setTileState<TTileData>(storageKey, prevData, false);
        return {
          data: prevData,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: false,
        };
      }
      // On success, update data and status
      this.setTileState<TTileData>(storageKey, tileData, true);
      return {
        data: tileData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      };
    } catch (error) {
      // Log error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logDetails: APILogDetails = {
        storageKey,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });
      // On error, update only lastDataRequest and lastDataRequestSuccessful, do not update data
      const cached = storageManager.getTileState<TTileData>(storageKey);
      const prevData =
        cached && cached.data ? cached.data : (parser.createDefault() as unknown as TTileData);
      this.setTileState<TTileData>(storageKey, prevData, false);
      return {
        data: prevData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      };
    }
  }
}
