import { useState, useCallback, useMemo } from 'react';
import type { ResizeState, UseTileResizeReturn } from '../types/dragDrop';

export function useTileResize(
  onTileResize: (tileId: string, newSize: string) => void,
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
    setResizeState((prev) => ({
      ...prev,
      currentSize: newSize ? (newSize as string) : prev.currentSize,
    }));
  }, []);

  const endResize = useCallback(() => {
    if (resizeState.resizingTileId && resizeState.currentSize) {
      onTileResize(resizeState.resizingTileId, resizeState.currentSize);
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

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      resizeState,
      startResize,
      updateResize,
      endResize,
      cancelResize,
    }),
    [resizeState, startResize, updateResize, endResize, cancelResize],
  );
}
