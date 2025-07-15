// Re-export BaseTileData for convenience
export type { TileDataType as BaseTileData } from './storageManager';

// Base interface for all API responses
export interface BaseApiResponse {
  [key: string]: unknown;
}

// Base interface for data mappers - maps API response to tile content data
export interface DataMapper<TApiResponse extends BaseApiResponse, TTileData> {
  /**
   * Maps API response to tile content data
   * @param apiResponse - Raw API response
   * @returns Mapped tile content data
   */
  map(apiResponse: TApiResponse): TTileData;

  /**
   * Validates if the API response is valid
   * @param apiResponse - Raw API response
   * @returns True if valid, false otherwise
   */
  validate(apiResponse: unknown): apiResponse is TApiResponse;

  /**
   * Creates a default/empty tile content data object
   * @returns Default tile content data
   */
  createDefault(): TTileData;

  /**
   * Safely maps API response with error handling
   * @param apiResponse - Raw API response
   * @returns Mapped tile content data or default if mapping fails
   */
  safeMap(apiResponse: unknown): TTileData;
}

// Utility type for creating tile data with proper typing
export type TileDataFactory<TTileData> = () => TTileData;

// Base implementation for common data mapping patterns
export abstract class BaseDataMapper<TApiResponse extends BaseApiResponse, TTileData>
  implements DataMapper<TApiResponse, TTileData>
{
  abstract map(apiResponse: TApiResponse): TTileData;
  abstract validate(apiResponse: unknown): apiResponse is TApiResponse;
  abstract createDefault(): TTileData;

  /**
   * Safely maps API response with error handling
   * @param apiResponse - Raw API response
   * @returns Mapped tile content data or default if mapping fails
   */
  safeMap(apiResponse: unknown): TTileData {
    if (this.validate(apiResponse)) {
      try {
        return this.map(apiResponse);
      } catch (error) {
        console.error('Data mapping failed:', error);
        return this.createDefault();
      }
    }
    console.warn('Invalid API response format');
    return this.createDefault();
  }
}

// Registry for data mappers
export class DataMapperRegistry {
  private static mappers = new Map<string, DataMapper<BaseApiResponse, unknown>>();

  /**
   * Register a data mapper for a specific tile type
   * @param tileType - Unique identifier for the tile type
   * @param mapper - Data mapper instance
   */
  static register<TTileType extends string, TApiResponse extends BaseApiResponse, TTileData>(
    tileType: TTileType,
    mapper: DataMapper<TApiResponse, TTileData>,
  ): void {
    this.mappers.set(tileType, mapper as DataMapper<BaseApiResponse, unknown>);
  }

  /**
   * Get a data mapper for a specific tile type
   * @param tileType - Unique identifier for the tile type
   * @returns Data mapper instance or undefined if not found
   */
  static get<TTileType extends string, TApiResponse extends BaseApiResponse, TTileData>(
    tileType: TTileType,
  ): DataMapper<TApiResponse, TTileData> | undefined {
    return this.mappers.get(tileType) as DataMapper<TApiResponse, TTileData> | undefined;
  }

  /**
   * Check if a data mapper exists for a tile type
   * @param tileType - Unique identifier for the tile type
   * @returns True if mapper exists
   */
  static has(tileType: string): boolean {
    return this.mappers.has(tileType);
  }

  /**
   * Get all registered tile types
   * @returns Array of registered tile types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.mappers.keys());
  }
}
