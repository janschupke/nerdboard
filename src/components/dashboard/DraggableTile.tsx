import { useRef, useState } from 'react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import type { TileConfig } from '../../types/dashboard';
import { Icon } from '../ui/Icon';

interface DraggableTileProps {
  tile: TileConfig;
  children: React.ReactNode;
  onMove: (tileId: string, newPosition: { x: number; y: number }) => void;
}

export function DraggableTile({ tile, children, onMove }: DraggableTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { dragState, startDrag, updateDrag, endDrag } = useDragAndDrop(onMove);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      startDrag(tile.id, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging) {
      updateDrag({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (dragState.isDragging) {
      endDrag();
    }
  };

  const getTileClasses = () => {
    const baseClasses = 'relative bg-white rounded-lg shadow-md border border-gray-200';
    const dragClasses = dragState.isDragging ? 'opacity-75 shadow-lg z-50' : '';
    const hoverClasses = isHovered ? 'shadow-lg' : '';
    
    return `${baseClasses} ${dragClasses} ${hoverClasses}`;
  };

  return (
    <div
      ref={tileRef}
      className={getTileClasses()}
      style={{
        gridColumn: `span ${tile.size === 'large' ? 2 : 1}`,
        gridRow: `span ${tile.size === 'large' ? 2 : 1}`,
        cursor: dragState.isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${tile.type} tile`}
    >
      {children}
      
      {/* Resize Handle */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
        <div className="w-full h-full bg-gray-300 rounded-bl-lg opacity-0 hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 w-6 h-6 cursor-grab active:cursor-grabbing">
        <div className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
          <Icon name="drag" size="sm" />
        </div>
      </div>
    </div>
  );
} 
