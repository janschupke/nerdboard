import { BaseDataMapper } from '../../../services/dataMapper';
import type { CryptocurrencyApiData, CryptocurrencyTileData } from './types';

export class CryptocurrencyDataMapper extends BaseDataMapper<
  CryptocurrencyApiData[],
  CryptocurrencyTileData
> {
  map(apiResponse: CryptocurrencyApiData[]): CryptocurrencyTileData {
    return {
      coins: Array.isArray(apiResponse) ? apiResponse : [],
    };
  }

  validate(apiResponse: unknown): apiResponse is CryptocurrencyApiData[] {
    return (
      Array.isArray(apiResponse) &&
      apiResponse.every(
        (coin) =>
          typeof coin.id === 'string' &&
          typeof coin.symbol === 'string' &&
          typeof coin.name === 'string' &&
          typeof coin.current_price === 'number',
      )
    );
  }

  createDefault(): CryptocurrencyTileData {
    return {
      coins: [],
    };
  }
}

import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('cryptocurrency', new CryptocurrencyDataMapper());
