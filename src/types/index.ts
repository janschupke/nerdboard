export * from './dashboard';
export * from './cryptocurrency';
export * from './preciousMetals';
export * from './animations';
export * from './dragDrop';
export * from './errors';
export { TileType, TileSize } from './dashboard';

// Common types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}
