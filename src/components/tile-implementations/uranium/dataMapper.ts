import { BaseDataMapper } from '../../../services/dataMapper';
import type { UraniumTileData as UraniumTileDataType, UraniumApiData } from './types';
export type { UraniumTileDataType as UraniumTileData };

// Extend UraniumApiData to satisfy BaseApiResponse constraint
export interface UraniumApiDataWithIndex extends UraniumApiData {
  [key: string]: unknown;
}

export class UraniumDataMapper extends BaseDataMapper<
  UraniumApiDataWithIndex,
  UraniumTileDataType
> {
  map(apiResponse: UraniumApiDataWithIndex): UraniumTileDataType {
    return {
      spotPrice: apiResponse.spotPrice,
      change: apiResponse.change,
      changePercent: apiResponse.changePercent,
      lastUpdated: apiResponse.lastUpdated,
      volume: apiResponse.volume,
      supply: apiResponse.supply,
      demand: apiResponse.demand,
      marketStatus: apiResponse.marketStatus,
      history: Array.isArray(apiResponse.history) ? apiResponse.history : [],
    };
  }

  validate(apiResponse: unknown): apiResponse is UraniumApiDataWithIndex {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }
    const response = apiResponse as Record<string, unknown>;
    const requiredFields = ['spotPrice', 'change', 'changePercent', 'lastUpdated', 'history'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }
    return (
      typeof response.spotPrice === 'number' &&
      typeof response.change === 'number' &&
      typeof response.changePercent === 'number' &&
      typeof response.lastUpdated === 'string' &&
      Array.isArray(response.history)
    );
  }

  createDefault(): UraniumTileDataType {
    return {
      spotPrice: 0,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      history: [],
    };
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('uranium', new UraniumDataMapper());
