import { BaseDataMapper } from '../../../services/dataMapper';
import type { CryptocurrencyApiResponse, CryptocurrencyTileData } from './types';
import { DataMapperRegistry } from '../../../services/dataMapper';
import { TileType } from '../../../types/tile';

export class CryptocurrencyDataMapper extends BaseDataMapper<
  CryptocurrencyApiResponse[],
  CryptocurrencyTileData
> {
  map(apiResponse: CryptocurrencyApiResponse[]): CryptocurrencyTileData {
    return {
      coins: Array.isArray(apiResponse) ? apiResponse : [],
    };
  }

  validate(apiResponse: unknown): apiResponse is CryptocurrencyApiResponse[] {
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

DataMapperRegistry.register(TileType.CRYPTOCURRENCY, new CryptocurrencyDataMapper());
