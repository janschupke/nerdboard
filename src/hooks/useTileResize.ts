import { useState, useCallback } from 'react';
import type { ResizeState, UseTileResizeReturn } from '../types/dragDrop';
import type { TileSize } from '../types/dashboard';

export function useTileResize(
  onTileResize: (tileId: string, newSize: TileSize) => void
): UseTileResizeReturn {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizingTileId: null,
    startSize: 'medium',
    currentSize: 'medium',
    resizeDirection: 'both',
  });

  const startResize = useCallback((tileId: string, direction: string, startSize: string) => {
    setResizeState({
      isResizing: true,
      resizingTileId: tileId,
      startSize,
      currentSize: startSize,
      resizeDirection: direction as 'horizontal' | 'vertical' | 'both',
    });
  }, []);

  const updateResize = useCallback((newSize: Partial<string>) => {
    setResizeState(prev => ({
      ...prev,
      currentSize: newSize || prev.currentSize,
    }));
  }, []);

  const endResize = useCallback(() => {
    if (resizeState.resizingTileId) {
      onTileResize(resizeState.resizingTileId, resizeState.currentSize as TileSize);
    }
    setResizeState({
      isResizing: false,
      resizingTileId: null,
      startSize: 'medium',
      currentSize: 'medium',
      resizeDirection: 'both',
    });
  }, [resizeState.resizingTileId, resizeState.currentSize, onTileResize]);

  const cancelResize = useCallback(() => {
    setResizeState({
      isResizing: false,
      resizingTileId: null,
      startSize: 'medium',
      currentSize: 'medium',
      resizeDirection: 'both',
    });
  }, []);

  return {
    resizeState,
    startResize,
    updateResize,
    endResize,
    cancelResize,
  };
} 
