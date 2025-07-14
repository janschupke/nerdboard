import { createContext, useContext } from 'react';

export interface DragboardConfig {
  columns: number;
  rows: number;
  tileSizes: Record<'small' | 'medium' | 'large', { colSpan: number; rowSpan: number }>;
  breakpoints: Record<string, number>;
}

interface DragboardContextValue {
  config: DragboardConfig;
  // Add drag/resize state here as needed
}

export const DragboardContext = createContext<DragboardContextValue | undefined>(undefined);

export const useDragboard = () => {
  const ctx = useContext(DragboardContext);
  if (!ctx) throw new Error('useDragboard must be used within DragboardProvider');
  return ctx;
}; 
