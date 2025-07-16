import { BaseDataMapper } from '../../../services/dataMapper';
import type { PreciousMetalsTileData, PreciousMetalsApiResponse } from './types';

export interface PreciousMetalsApiResponseWithIndex extends PreciousMetalsApiResponse {
  [key: string]: unknown;
}

export class PreciousMetalsDataMapper extends BaseDataMapper<
  PreciousMetalsApiResponseWithIndex,
  PreciousMetalsTileData
> {
  map(apiResponse: PreciousMetalsApiResponseWithIndex): PreciousMetalsTileData {
    return {
      gold: {
        price: apiResponse.gold.price,
        change_24h: apiResponse.gold.change_24h,
        change_percentage_24h: apiResponse.gold.change_percentage_24h,
      },
      silver: {
        price: apiResponse.silver.price,
        change_24h: apiResponse.silver.change_24h,
        change_percentage_24h: apiResponse.silver.change_percentage_24h,
      },
    };
  }

  validate(apiResponse: unknown): apiResponse is PreciousMetalsApiResponseWithIndex {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    if (
      !response.gold ||
      !response.silver ||
      typeof response.gold !== 'object' ||
      typeof response.silver !== 'object'
    ) {
      return false;
    }

    const gold = response.gold as Record<string, unknown>;
    const silver = response.silver as Record<string, unknown>;

    const requiredFields = ['price', 'change_24h', 'change_percentage_24h'];

    for (const field of requiredFields) {
      if (!(field in gold) || !(field in silver)) {
        return false;
      }
    }

    return (
      typeof gold.price === 'number' &&
      typeof gold.change_24h === 'number' &&
      typeof gold.change_percentage_24h === 'number' &&
      typeof silver.price === 'number' &&
      typeof silver.change_24h === 'number' &&
      typeof silver.change_percentage_24h === 'number'
    );
  }

  createDefault(): PreciousMetalsTileData {
    return {
      gold: {
        price: 0,
        change_24h: 0,
        change_percentage_24h: 0,
      },
      silver: {
        price: 0,
        change_24h: 0,
        change_percentage_24h: 0,
      },
    };
  }
}

import { DataMapperRegistry } from '../../../services/dataMapper';
DataMapperRegistry.register('precious-metals', new PreciousMetalsDataMapper());
