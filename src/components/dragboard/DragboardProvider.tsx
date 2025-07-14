import React, { useMemo } from 'react';
import { DragboardContext } from './DragboardContext.ts';
import type { DragboardConfig } from './DragboardContext.ts';

interface DragboardProviderProps {
  config: DragboardConfig;
  children: React.ReactNode;
}

export const DragboardProvider: React.FC<DragboardProviderProps> = ({ config, children }) => {
  const value = useMemo(() => ({ config }), [config]);
  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
}; 
