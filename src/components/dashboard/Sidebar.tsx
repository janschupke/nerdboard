import React, { useMemo } from 'react';
import { TileType } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onTileSelect: (tileType: TileType) => void;
}

export const Sidebar = React.memo<SidebarProps>(({ isOpen, onToggle, onTileSelect }) => {
  // Memoize sidebar classes
  const sidebarClasses = useMemo(() => {
    const baseClasses = 'bg-surface-secondary border-r border-surface-tertiary transition-all duration-300 ease-in-out';
    const widthClasses = isOpen ? 'w-64' : 'w-16';
    return `${baseClasses} ${widthClasses}`;
  }, [isOpen]);

  const availableTiles = useMemo(() => [
    {
      type: TileType.CRYPTOCURRENCY,
      name: 'Cryptocurrency',
      description: 'Real-time cryptocurrency prices',
      icon: 'crypto',
    },
    {
      type: TileType.PRECIOUS_METALS,
      name: 'Precious Metals',
      description: 'Gold and silver prices',
      icon: 'metals',
    },
    {
      type: TileType.FEDERAL_FUNDS_RATE,
      name: 'Federal Funds Rate',
      description: 'Current interest rates',
      icon: 'chart',
    },
  ], []);

  return (
    <aside className={sidebarClasses}>
      {/* Sidebar content */}
      <div className="p-4">
        <Button onClick={onToggle} variant="secondary" size="sm">
          <Icon name="menu" size={16} />
        </Button>
      </div>
      {isOpen && (
        <div className="p-4 space-y-2">
          {availableTiles.map((tile) => (
            <Button
              key={tile.type}
              onClick={() => onTileSelect(tile.type)}
              variant="secondary"
              size="sm"
              className="w-full justify-start"
            >
              <Icon name={tile.icon} size={16} className="mr-2" />
              {tile.name}
            </Button>
          ))}
        </div>
      )}
    </aside>
  );
});
