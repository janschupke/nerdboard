import { useState, useCallback, useMemo } from 'react';
import type { DragState, UseDragAndDropReturn } from '../types/dragDrop';

export function useDragAndDrop(
  onTileMove: (tileId: string, newPosition: { x: number; y: number }) => void,
): UseDragAndDropReturn {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTileId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    dropZone: null,
  });

  const startDrag = useCallback((tileId: string, position: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      draggedTileId: tileId,
      startPosition: position,
      currentPosition: position,
      dropZone: null,
    });
  }, []);

  const updateDrag = useCallback((position: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      currentPosition: position,
    }));
  }, []);

  const endDrag = useCallback(() => {
    if (dragState.draggedTileId && dragState.dropZone) {
      onTileMove(dragState.draggedTileId, dragState.dropZone);
    }
    setDragState({
      isDragging: false,
      draggedTileId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dropZone: null,
    });
  }, [dragState.draggedTileId, dragState.dropZone, onTileMove]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedTileId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dropZone: null,
    });
  }, []);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      dragState,
      startDrag,
      updateDrag,
      endDrag,
      cancelDrag,
    }),
    [dragState, startDrag, updateDrag, endDrag, cancelDrag],
  );
}
