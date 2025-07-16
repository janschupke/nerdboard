import { BaseDataMapper } from '../../../services/dataMapper';
import type { UraniumTileData, UraniumApiResponse } from './types';
export type { UraniumTileData as UraniumTileData };

// Extend UraniumApiData to satisfy BaseApiResponse constraint
export interface UraniumApiResponseWithIndex extends UraniumApiResponse {
  [key: string]: unknown;
}

export class UraniumDataMapper extends BaseDataMapper<
  UraniumApiResponseWithIndex,
  UraniumTileData
> {
  map(apiResponse: UraniumApiResponseWithIndex): UraniumTileData {
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

  validate(apiResponse: unknown): apiResponse is UraniumApiResponseWithIndex {
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

  createDefault(): UraniumTileData {
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
import { TileType } from '../../../types/tile';

DataMapperRegistry.register(TileType.URANIUM, new UraniumDataMapper());
