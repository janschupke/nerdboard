import React from 'react';
import { useDragboard } from './DragboardContext';

interface DragboardGridProps {
  children: React.ReactNode;
}

export const DragboardGrid: React.FC<DragboardGridProps> = ({ children }) => {
  const { config } = useDragboard();
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
    gap: '1rem',
    width: '100%',
    height: '100%',
  };
  return (
    <div className="relative w-full h-full p-4" style={gridStyle} role="grid" data-testid="dragboard-grid">
      {children}
    </div>
  );
}; 
