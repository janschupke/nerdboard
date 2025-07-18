import { BaseDataMapper } from '../../../services/dataMapper';
import type { PreciousMetalsTileData } from './types';
import type { BaseApiResponse } from '../../../services/dataMapper';

// This mapper is a passthrough; mapping is done in the hook for gold-api.com spot price data.
export class PreciousMetalsDataMapper extends BaseDataMapper<
  BaseApiResponse,
  PreciousMetalsTileData
> {
  map(apiResponse: BaseApiResponse): PreciousMetalsTileData {
    return apiResponse as unknown as PreciousMetalsTileData;
  }
  validate(apiResponse: unknown): apiResponse is BaseApiResponse {
    return !!apiResponse && typeof apiResponse === 'object';
  }
  createDefault(): PreciousMetalsTileData {
    return {
      gold: { price: 0, change_24h: 0, change_percentage_24h: 0 },
      silver: { price: 0, change_24h: 0, change_percentage_24h: 0 },
    };
  }
}
