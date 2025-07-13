import type { BaseComponentProps } from './index';

export interface PreciousMetalsData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  lastUpdated: string;
}

export interface PreciousMetalsApiResponse {
  data: PreciousMetalsData[];
  timestamp: number;
  success: boolean;
}

export interface PreciousMetalsTileProps extends BaseComponentProps {
  data?: PreciousMetalsData[];
  loading?: boolean;
  error?: Error | null;
  refreshInterval?: number;
}

export interface PreciousMetalsConfig {
  metals: string[];
  refreshInterval: number;
  showChart: boolean;
  maxItems: number;
}

export interface PreciousMetalsHookResult {
  data: PreciousMetalsData[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';
