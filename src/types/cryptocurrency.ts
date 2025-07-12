export interface CryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface CryptocurrencyTileConfig {
  selectedCoins?: string[];
  chartPeriod?: '7d' | '30d' | '1y';
}
