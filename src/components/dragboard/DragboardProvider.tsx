import React from 'react';
import { DragboardContext } from './DragboardContext';
import type { DragboardConfig, DragboardDragState, DragboardContextValue } from './DragboardContext';

interface DragboardProviderProps {
  config: DragboardConfig;
  children: React.ReactNode;
  endTileDrag?: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  endSidebarDrag?: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  removeTile?: (tileId: string) => void;
}

export const DragboardProvider: React.FC<DragboardProviderProps> = ({ config, children, endTileDrag, endSidebarDrag, removeTile }) => {
  const [dragState, setDragState] = React.useState<DragboardDragState>({
    draggingTileId: null,
    dragOrigin: null,
    dragOffset: null,
    dropTarget: null,
    isSidebarDrag: false,
    sidebarTileType: undefined,
  });

  // Tile drag actions
  const startTileDrag = React.useCallback((tileId: string, origin: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: tileId,
      dragOrigin: origin,
      dragOffset: { x: 0, y: 0 },
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
  }, []);

  const updateTileDrag = React.useCallback((offset: { x: number; y: number }) => {
    setDragState((prev) => ({ ...prev, dragOffset: offset }));
  }, []);

  const _endTileDrag = React.useCallback((dropTarget: { x: number; y: number } | null, tileId?: string) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: null,
      dragOrigin: null,
      dragOffset: null,
      dropTarget,
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
    if (endTileDrag) {
      endTileDrag(dropTarget, tileId);
    }
  }, [endTileDrag]);

  // Sidebar drag actions
  const startSidebarDrag = React.useCallback((tileType: string) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: null,
      dragOrigin: null,
      dragOffset: null,
      dropTarget: null,
      isSidebarDrag: true,
      sidebarTileType: tileType,
    }));
  }, []);

  const _endSidebarDrag = React.useCallback((dropTarget: { x: number; y: number } | null, tileType?: string) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: null,
      dragOrigin: null,
      dragOffset: null,
      dropTarget,
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
    if (endSidebarDrag) {
      endSidebarDrag(dropTarget, tileType);
    }
  }, [endSidebarDrag]);

  // Remove tile action (to be connected to dashboard state)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _removeTile = React.useCallback((tileId: string) => {
    if (removeTile) {
      removeTile(tileId);
    }
  }, [removeTile]);

  // Set drop target for drag-over events
  const setDropTarget = React.useCallback((target: { x: number; y: number } | null) => {
    setDragState((prev) => ({ ...prev, dropTarget: target }));
  }, []);

  const value = React.useMemo<DragboardContextValue>(
    () => ({
      config,
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag: _endTileDrag,
      startSidebarDrag,
      endSidebarDrag: _endSidebarDrag,
      setDropTarget,
      removeTile: _removeTile,
    }),
    [config, dragState, startTileDrag, updateTileDrag, _endTileDrag, startSidebarDrag, _endSidebarDrag, setDropTarget, _removeTile]
  );

  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
}; 
