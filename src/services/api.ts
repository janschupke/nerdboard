// API service for the Nerdboard dashboard application

import type { ApiResponse } from '../types';
import { interceptAPIError } from './apiErrorInterceptor';
import type { APIError } from './apiErrorInterceptor';

export class ApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorInfo: APIError = {
          apiCall: url,
          reason: `HTTP error! status: ${response.status}`,
          details: { status: response.status, url },
        };
        interceptAPIError(errorInfo);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      const errorInfo: APIError = {
        apiCall: url,
        reason: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
      };
      interceptAPIError(errorInfo);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}
