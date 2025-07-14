import type { BaseComponentProps } from './index';

export interface MetalData {
  price: number;
  change_24h: number;
  change_percentage_24h: number;
}

export interface PreciousMetalsData {
  gold: MetalData;
  silver: MetalData;
}

export interface PreciousMetalsApiResponse {
  data: PreciousMetalsData;
  timestamp: number;
  success: boolean;
}

export interface PreciousMetalsTileProps extends BaseComponentProps {
  data?: PreciousMetalsData;
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
  data: PreciousMetalsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';
