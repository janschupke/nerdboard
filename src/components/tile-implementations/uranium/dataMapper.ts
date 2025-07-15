import { BaseDataMapper } from '../../../services/dataMapper';
import type { UraniumPriceData, UraniumApiResponse } from './types';

// Extend UraniumApiResponse to satisfy BaseApiResponse constraint
interface ExtendedUraniumApiResponse extends UraniumApiResponse {
  [key: string]: unknown;
}

export class UraniumDataMapper extends BaseDataMapper<
  ExtendedUraniumApiResponse,
  UraniumPriceData
> {
  map(apiResponse: ExtendedUraniumApiResponse): UraniumPriceData {
    return {
      spotPrice: apiResponse.spotPrice,
      change: apiResponse.change,
      changePercent: apiResponse.changePercent,
      lastUpdated: apiResponse.lastUpdated,
      volume: apiResponse.volume,
      supply: apiResponse.supply,
      demand: apiResponse.demand,
      marketStatus: apiResponse.marketStatus,
    };
  }

  validate(apiResponse: unknown): apiResponse is ExtendedUraniumApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    const requiredFields = ['spotPrice', 'change', 'changePercent', 'lastUpdated'];

    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof response.spotPrice === 'number' &&
      typeof response.change === 'number' &&
      typeof response.changePercent === 'number' &&
      typeof response.lastUpdated === 'string'
    );
  }

  createDefault(): UraniumPriceData {
    return {
      spotPrice: 0,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('uranium', new UraniumDataMapper());
