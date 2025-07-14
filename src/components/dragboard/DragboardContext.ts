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

/**
 * Interface for items that can be dropped into the dragboard grid.
 * External components (e.g., sidebar menu items) should implement this for type safety.
 */
export interface DragboardDroppableItem {
  /**
   * The unique type or identifier for the tile/item.
   */
  tileType: string;
  /**
   * Optionally, the default size for the tile when dropped (e.g., 'small', 'medium', 'large').
   */
  defaultSize?: 'small' | 'medium' | 'large';
  /**
   * Optionally, any initial config or data for the tile.
   */
  initialConfig?: Record<string, unknown>;
}

/**
 * Interface for dragboard-compatible sidebar drag items.
 * Used for type checking and documentation.
 */
export interface DragboardSidebarDragItem extends DragboardDroppableItem {
  /**
   * Optionally, a display name for the item.
   */
  displayName?: string;
  /**
   * Optionally, an icon name or component for the item.
   */
  icon?: string;
}

export const DragboardContext = createContext<DragboardContextValue | undefined>(undefined);

export const useDragboard = () => {
  const ctx = useContext(DragboardContext);
  if (!ctx) throw new Error('useDragboard must be used within DragboardProvider');
  return ctx;
};
