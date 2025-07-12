import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TileGrid } from './TileGrid';

// Mock useDashboard hook
vi.mock('../../hooks/useDashboard', () => ({
  useDashboard: () => ({
    state: {
      tiles: [],
    },
    removeTile: vi.fn(),
    addTile: vi.fn(),
    moveTile: vi.fn(),
  }),
}));

// Mock Tile component
vi.mock('./Tile', () => ({
  Tile: ({ tile }: { tile: any }) => (
    <div data-testid={`tile-${tile.id}`}>
      {tile.type} Tile
    </div>
  ),
}));

// Mock DraggableTile component
vi.mock('./DraggableTile', () => ({
  DraggableTile: ({ children, tile }: { children: React.ReactNode; tile: any }) => (
    <div data-testid={`draggable-tile-${tile.id}`}>
      {children}
    </div>
  ),
}));

describe('TileGrid', () => {
  it('renders empty state when no tiles', () => {
    render(<TileGrid />);
    
    expect(screen.getByText('Welcome to Nerdboard')).toBeInTheDocument();
    expect(screen.getByText('Add tiles from the sidebar to get started')).toBeInTheDocument();
    expect(screen.getByText('Click the menu button to open the sidebar')).toBeInTheDocument();
  });

  it.skip('renders empty state with correct styling', () => {
    render(<TileGrid />);
    
    const container = screen.getByText('Welcome to Nerdboard').closest('div');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
  });

  it('renders empty state with theme classes', () => {
    render(<TileGrid />);
    
    const heading = screen.getByText('Welcome to Nerdboard');
    expect(heading).toHaveClass('text-theme-primary');
    
    const paragraph = screen.getByText('Add tiles from the sidebar to get started');
    expect(paragraph).toHaveClass('text-theme-secondary');
  });

  it('renders with correct layout structure', () => {
    render(<TileGrid />);
    
    const mainContainer = screen.getByText('Welcome to Nerdboard').closest('div')?.parentElement;
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
  });
}); 
