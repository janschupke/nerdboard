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

  // Helper to handle fetch, status extraction, mapping/parsing, and error logging
  private async handleFetchAndTransform<TTileData extends TileDataType>(
    fetchFunction: () => Promise<unknown>,
    storageKey: string,
    apiCall: string,
    transform: (input: unknown) => TTileData,
    createDefault: () => TTileData,
  ): Promise<TileConfig<TTileData>> {
    const cached = storageManager.getTileState<TTileData>(storageKey);
    const now = Date.now();
    const isFresh = cached && now - cached.lastDataRequest < DATA_REFRESH_INTERVAL;
    if (cached && isFresh) {
      return {
        data: cached.data,
        lastDataRequest: cached.lastDataRequest,
        lastDataRequestSuccessful: cached.lastDataRequestSuccessful,
      };
    }
    let httpStatus: number | undefined;
    try {
      let apiResponse: unknown = await fetchFunction();
      // If fetchFunction returns a Response, extract status and data
      if (apiResponse instanceof Response) {
        httpStatus = apiResponse.status;
        const contentType = apiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          apiResponse = await apiResponse.json();
        } else {
          apiResponse = await apiResponse.text();
        }
      } else if (
        apiResponse &&
        typeof apiResponse === 'object' &&
        'data' in apiResponse &&
        'status' in apiResponse &&
        typeof (apiResponse as { status?: unknown }).status === 'number'
      ) {
        httpStatus = (apiResponse as { status: number }).status;
        apiResponse = (apiResponse as { data: unknown }).data;
      }
      // If the API response contains an 'error' property, treat as error
      if (apiResponse && typeof apiResponse === 'object' && 'error' in apiResponse) {
        throw Object.assign(
          new Error(((apiResponse as Record<string, unknown>).error as string) || 'API error'),
          { status: httpStatus },
        );
      }
      const transformed = transform(apiResponse);
      this.setTileState<TTileData>(storageKey, transformed, true);
      return {
        data: transformed,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: true,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof (error as { status?: unknown }).status === 'number'
      ) {
        httpStatus = (error as { status: number }).status;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      const logDetails: APILogDetails = {
        storageKey,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
        ...(httpStatus !== undefined ? { status: httpStatus } : {}),
      };
      storageManager.addLog({
        level: APILogLevel.ERROR,
        apiCall,
        reason: errorMessage,
        details: logDetails,
      });
      const prevData = cached && cached.data ? cached.data : createDefault();
      this.setTileState<TTileData>(storageKey, prevData, false);
      return {
        data: prevData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      };
    }
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
    const { apiCall = tileType } = options;
    const mapper = this.mapperRegistry.get<TTileType, TApiResponse, TTileData>(tileType);
    if (!mapper) {
      throw new Error(`No data mapper found for tile type: ${tileType}`);
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => mapper.safeMap(input) as unknown as TTileData,
      () => mapper.createDefault() as unknown as TTileData,
    );
  }

  async fetchAndParse<TTileType extends string, TRawData, TTileData extends TileDataType>(
    fetchFunction: () => Promise<TRawData>,
    storageKey: string,
    tileType: TTileType,
    options: FetchOptions = { apiCall: tileType },
  ): Promise<TileConfig<TTileData>> {
    const { apiCall = tileType } = options;
    const parser = this.parserRegistry.get<TTileType, TRawData, TTileData>(tileType);
    if (!parser) {
      throw new Error(`No parser registered for tile type: ${tileType}`);
    }
    return this.handleFetchAndTransform(
      fetchFunction,
      storageKey,
      apiCall,
      (input) => parser.safeParse(input) as unknown as TTileData,
      () => parser.createDefault() as unknown as TTileData,
    );
  }
}
