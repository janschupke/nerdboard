import { createContext } from 'react';

interface TileData {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isCached: boolean;
}

interface TileDataContextType {
  getTileData: () => TileData;
}

export const TileDataContext = createContext<TileDataContextType | null>(null);
