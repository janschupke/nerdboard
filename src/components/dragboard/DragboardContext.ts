import { createContext, useContext } from 'react';

export interface DragboardConfig {
  columns: number;
  rows: number;
  tileSizes: Record<'small' | 'medium' | 'large', { colSpan: number; rowSpan: number }>;
  breakpoints: Record<string, number>;
}

export interface DragboardDragState {
  draggingTileId: string | null;
  dragOrigin: { x: number; y: number } | null;
  dragOffset: { x: number; y: number } | null;
  dropTarget: { x: number; y: number } | null;
  isSidebarDrag: boolean;
  sidebarTileType?: string;
}

export interface DragboardContextValue {
  config: DragboardConfig;
  dragState: DragboardDragState;
  startTileDrag: (tileId: string, origin: { x: number; y: number }) => void;
  updateTileDrag: (offset: { x: number; y: number }) => void;
  endTileDrag: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  setDropTarget: (target: { x: number; y: number } | null) => void;
  removeTile: (tileId: string) => void;
}

export const DragboardContext = createContext<DragboardContextValue | undefined>(undefined);

export const useDragboard = () => {
  const ctx = useContext(DragboardContext);
  if (!ctx) throw new Error('useDragboard must be used within DragboardProvider');
  return ctx;
}; 
