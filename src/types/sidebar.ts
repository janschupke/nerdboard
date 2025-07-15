import type { BaseComponentProps } from './index';
import type { TileType } from './tile';

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  onTileSelect: (tileType: TileType) => void;
} 
