import { BaseDataMapper, type BaseApiResponse } from '../../../services/dataMapper';
import type { CryptocurrencyData } from './types';

// API response type from CoinGecko
export interface CoinGeckoApiResponse extends BaseApiResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
}

export class CryptocurrencyDataMapper extends BaseDataMapper<
  CoinGeckoApiResponse,
  CryptocurrencyData
> {
  map(apiResponse: CoinGeckoApiResponse): CryptocurrencyData {
    return {
      id: apiResponse.id,
      symbol: apiResponse.symbol,
      name: apiResponse.name,
      current_price: apiResponse.current_price,
      market_cap: apiResponse.market_cap,
      market_cap_rank: apiResponse.market_cap_rank,
      price_change_percentage_24h: apiResponse.price_change_percentage_24h,
      price_change_24h: apiResponse.price_change_24h,
      total_volume: apiResponse.total_volume,
      circulating_supply: apiResponse.circulating_supply,
      total_supply: apiResponse.total_supply,
      max_supply: apiResponse.max_supply,
      ath: apiResponse.ath,
      ath_change_percentage: apiResponse.ath_change_percentage,
      atl: apiResponse.atl,
      atl_change_percentage: apiResponse.atl_change_percentage,
      last_updated: apiResponse.last_updated,
    };
  }

  validate(apiResponse: unknown): apiResponse is CoinGeckoApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    const requiredFields = [
      'id',
      'symbol',
      'name',
      'current_price',
      'market_cap',
      'market_cap_rank',
      'price_change_percentage_24h',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof response.id === 'string' &&
      typeof response.symbol === 'string' &&
      typeof response.name === 'string' &&
      typeof response.current_price === 'number' &&
      typeof response.market_cap === 'number' &&
      typeof response.market_cap_rank === 'number' &&
      typeof response.price_change_percentage_24h === 'number'
    );
  }

  createDefault(): CryptocurrencyData {
    return {
      id: '',
      symbol: '',
      name: '',
      current_price: 0,
      market_cap: 0,
      market_cap_rank: 0,
      price_change_percentage_24h: 0,
      price_change_24h: 0,
      total_volume: 0,
      circulating_supply: 0,
      total_supply: 0,
      max_supply: 0,
      ath: 0,
      ath_change_percentage: 0,
      atl: 0,
      atl_change_percentage: 0,
      last_updated: '',
    };
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('cryptocurrency', new CryptocurrencyDataMapper());
