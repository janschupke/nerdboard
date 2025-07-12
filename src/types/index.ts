// Common types for the Nerdboard dashboard application

export interface DashboardTile {
  id: string;
  type: 'market-data' | 'news' | 'weather' | 'custom';
  title: string;
  content: MarketData | NewsItem | WeatherData | Record<string, unknown>;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  refreshInterval?: number; // in milliseconds
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
} 
