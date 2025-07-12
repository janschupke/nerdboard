// API service for the Nerdboard dashboard application

import type { ApiResponse, MarketData, NewsItem, WeatherData } from '../types';

import { API_CONFIG } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.DEFAULT_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: null as T,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMarketData(symbols: string[]): Promise<ApiResponse<MarketData[]>> {
    const symbolsParam = symbols.join(',');
    return this.request<MarketData[]>(`/api/market-data?symbols=${symbolsParam}`);
  }

  async getNews(category?: string, limit: number = 10): Promise<ApiResponse<NewsItem[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    return this.request<NewsItem[]>(`/api/news?${params.toString()}`);
  }

  async getWeather(location: string): Promise<ApiResponse<WeatherData>> {
    return this.request<WeatherData>(`/api/weather?location=${encodeURIComponent(location)}`);
  }

  async getCustomData(endpoint: string): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(endpoint);
  }
}

export const apiService = new ApiService();
export default apiService;
