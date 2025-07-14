import { useMemo } from 'react';
import { useContext } from 'react';
import { TileDataContext } from './TileDataContext';

export const useTileData = () => {
  const context = useContext(TileDataContext);
  if (!context) {
    throw new Error('useTileData must be used within TileDataProvider');
  }

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => context, [context]);
};
