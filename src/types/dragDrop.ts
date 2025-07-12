export interface DragState {
  isDragging: boolean;
  draggedTileId: string | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  dropZone: { x: number; y: number } | null;
}

export interface ResizeState {
  isResizing: boolean;
  resizingTileId: string | null;
  startSize: string;
  currentSize: string;
  resizeDirection: 'horizontal' | 'vertical' | 'both';
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  startDrag: (tileId: string, position: { x: number; y: number }) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  endDrag: () => void;
  cancelDrag: () => void;
}

export interface UseTileResizeReturn {
  resizeState: ResizeState;
  startResize: (tileId: string, direction: string, startSize: string) => void;
  updateResize: (newSize: Partial<string>) => void;
  endResize: () => void;
  cancelResize: () => void;
}
