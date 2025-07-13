import React, { createContext, useState, useCallback, useMemo } from 'react';

interface TileData {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isCached: boolean;
}

interface TileDataContextType {
  tileData: Record<string, TileData>;
  updateTileData: (tileId: string, data: TileData) => void;
  removeTileData: (tileId: string) => void;
  getTileData: (tileId: string) => TileData | undefined;
}

const TileDataContext = createContext<TileDataContextType | undefined>(undefined);

export const TileDataProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const [tileData, setTileData] = useState<Record<string, TileData>>({});

  const updateTileData = useCallback((tileId: string, data: TileData) => {
    setTileData(prev => ({
      ...prev,
      [tileId]: data,
    }));
  }, []);

  const removeTileData = useCallback((tileId: string) => {
    setTileData(prev => {
      const newData = { ...prev };
      delete newData[tileId];
      return newData;
    });
  }, []);

  const getTileData = useCallback((tileId: string) => {
    return tileData[tileId];
  }, [tileData]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tileData,
    updateTileData,
    removeTileData,
    getTileData,
  }), [tileData, updateTileData, removeTileData, getTileData]);

  return (
    <TileDataContext.Provider value={contextValue}>
      {children}
    </TileDataContext.Provider>
  );
});

export { TileDataContext }; 
