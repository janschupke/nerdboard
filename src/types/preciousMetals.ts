export interface PreciousMetalsData {
  gold: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
  silver: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
}

export interface PreciousMetalsTileConfig {
  selectedMetals?: ('gold' | 'silver')[];
  chartPeriod?: '7d' | '30d' | '1y';
} 
