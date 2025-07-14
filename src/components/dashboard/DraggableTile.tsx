import { useRef } from 'react';
import type { DashboardTile, TileSize } from '../../types/dashboard';
import { Icon } from '../ui/Icon';
import { useTileResize } from '../../hooks/useTileResize';
import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { useContext } from 'react';

interface DraggableTileProps {
  tile: DashboardTile;
  index: number;
  children: React.ReactNode;
  onMove: (from: number, to: number) => void;
}

export function DraggableTile({ tile, index, children, onMove }: DraggableTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('DraggableTile must be used within DashboardProvider');
  }

  const { updateTile } = dashboardContext;
  const { startResize, updateResize, endResize } = useTileResize((tileId, newSize) => {
    updateTile(tileId, { size: newSize as 'small' | 'medium' | 'large' });
  });

  // Drag and drop for reordering
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/nerdboard-tile-index', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // setIsDragOver(true); // Removed
  };

  const handleDrop = (e: React.DragEvent) => {
    // setIsDragOver(false); // Removed
    const fromIndex = Number(e.dataTransfer.getData('application/nerdboard-tile-index'));
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onMove(fromIndex, index);
    }
  };

  const handleDragLeave = () => {
    // setIsDragOver(false); // Removed
  };

  // --- Resize logic ---
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    startResize(tile.id, 'both', size);
    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const deltaX = e.clientX - rect.left;
    const deltaY = e.clientY - rect.top;
    // Snap logic: small < 200px, medium < 400px, else large
    let newSize: TileSize = 'small';
    if (deltaX > 350 || deltaY > 350) newSize = 'large';
    else if (deltaX > 180 || deltaY > 180) newSize = 'medium';
    updateResize(newSize);
  };

  const handleResizeMouseUp = () => {
    endResize();
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  };

  return (
    <Tile
      tile={tile}
      onRemove={undefined}
      dragHandleProps={{
        draggable: true,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onDragLeave: handleDragLeave,
      }}
    >
      {children}
      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
        onMouseDown={handleResizeMouseDown}
        title="Resize tile"
      >
        <div className="w-full h-full bg-theme-secondary rounded-bl-lg opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Icon name="resize" size="sm" />
        </div>
      </div>
    </Tile>
  );
}
