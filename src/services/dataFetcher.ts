import {
  APILogLevel,
  storageManager,
  type APILogDetails,
  type TileDataType,
  type TileConfig,
} from './storageManager';
import { type BaseApiResponse } from './dataMapper';
import { tileDataMappers, tileDataParsers } from './tileTypeRegistry';

export const DATA_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface FetchOptions {
  forceRefresh?: boolean;
  apiCall: string;
}

export class DataFetcher {
  // Centralized helper for setting tile state
  private static setTileState<T extends TileDataType>(
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

  static async fetchAndMap<
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
    const isFresh = cached && (now - cached.lastDataRequest < DATA_REFRESH_INTERVAL);

    if (!forceRefresh && cached && isFresh) {
      return {
        data: cached.data,
        lastDataRequest: cached.lastDataRequest,
        lastDataRequestSuccessful: cached.lastDataRequestSuccessful,
      };
    }

    const mapperFactory = tileDataMappers[tileType as keyof typeof tileDataMappers];
    const mapper = mapperFactory ? mapperFactory() : undefined;
    if (!mapper) {
      throw new Error(`No data mapper found for tile type: ${tileType}`);
    }

    try {
      const apiResponse = await fetchFunction();
      // If the API response contains an 'error' property, treat as error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (apiResponse && typeof apiResponse === 'object' && 'error' in apiResponse) {
        throw new Error((apiResponse as any).error || 'API error');
      }
      const mappedData = mapper.safeMap(apiResponse) as unknown as TTileData;
      // On success, update data and status
      DataFetcher.setTileState<TTileData>(storageKey, mappedData, true);
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
      const prevData = cached && cached.data ? cached.data : mapper.createDefault() as unknown as TTileData;
      DataFetcher.setTileState<TTileData>(storageKey, prevData, false);
      return {
        data: prevData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      };
    }
  }

  static async fetchAndParse<TTileType extends string, TRawData, TTileData extends TileDataType>(
    fetchFunction: () => Promise<TRawData>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
  ): Promise<TileConfig<TTileData>> {
    const { forceRefresh = false, apiCall = tileType } = options;
    const cached = storageManager.getTileState<TTileData>(storageKey);
    const now = Date.now();
    const isFresh = cached && (now - cached.lastDataRequest < DATA_REFRESH_INTERVAL);

    if (!forceRefresh && cached && isFresh) {
      return {
        data: cached.data,
        lastDataRequest: cached.lastDataRequest,
        lastDataRequestSuccessful: cached.lastDataRequestSuccessful,
      };
    }

    const parserFactory = tileDataParsers[tileType as keyof typeof tileDataParsers];
    const parser = parserFactory ? parserFactory() : undefined;
    if (!parser) {
      throw new Error(`No parser registered for tile type: ${tileType}`);
    }

    try {
      const rawData = await fetchFunction();
      const tileData = parser.safeParse(rawData) as unknown as TTileData;
      // On success, update data and status
      DataFetcher.setTileState<TTileData>(storageKey, tileData, true);
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
      const prevData = cached && cached.data ? cached.data : parser.createDefault() as unknown as TTileData;
      DataFetcher.setTileState<TTileData>(storageKey, prevData, false);
      return {
        data: prevData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      };
    }
  }
}
