import type { BaseComponentProps } from './index';

export interface CryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface CryptocurrencyApiResponse {
  data: CryptocurrencyData[];
  timestamp: number;
  success: boolean;
}

export interface CryptocurrencyTileProps extends BaseComponentProps {
  data?: CryptocurrencyData[];
  loading?: boolean;
  error?: Error | null;
  refreshInterval?: number;
}

export interface CryptocurrencyConfig {
  symbols: string[];
  refreshInterval: number;
  showChart: boolean;
  maxItems: number;
}

export interface CryptocurrencyHookResult {
  data: CryptocurrencyData[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
