import { createContext } from 'react';
import { TileType } from '../types/dashboard';

interface TileData {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isCached: boolean;
}

interface TileDataContextType {
  getTileData: (tileType: TileType) => TileData;
}

export const TileDataContext = createContext<TileDataContextType | null>(null); 
