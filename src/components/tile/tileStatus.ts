export interface TileStatus {
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

export interface TileDataHook<T = unknown> {
  (tileId: string): TileStatus & { data?: T };
} 
