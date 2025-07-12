import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableTile } from './DraggableTile';
import type { TileConfig } from '../../types/dashboard';

// Mock useDashboard hook
vi.mock('../../hooks/useDashboard', () => ({
  useDashboard: () => ({
    updateTileConfig: vi.fn(),
  }),
}));

// Mock useTileResize hook
vi.mock('../../hooks/useTileResize', () => ({
  useTileResize: () => ({
    startResize: vi.fn(),
    updateResize: vi.fn(),
    endResize: vi.fn(),
  }),
}));

// Mock Icon component
vi.mock('../ui/Icon', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  ),
}));

// Mock Tile component
vi.mock('./Tile', () => ({
  Tile: ({ children, dragHandleProps }: { children: React.ReactNode; dragHandleProps?: Record<string, unknown> }) => (
    <div data-testid="tile-wrapper">
      {children}
      {dragHandleProps && (
        <div data-testid="drag-handle" {...dragHandleProps}>
          Drag Handle
        </div>
      )}
    </div>
  ),
}));

describe('DraggableTile', () => {
  const mockTile: TileConfig = {
    id: 'test-tile-1',
    type: 'cryptocurrency',
    position: { x: 0, y: 0 },
    size: 'medium',
    config: {},
  };

  const mockProps = {
    tile: mockTile,
    index: 0,
    children: <div data-testid="tile-content">Tile Content</div>,
    onMove: vi.fn(),
  };

  it('renders tile with children', () => {
    render(<DraggableTile {...mockProps} />);

    expect(screen.getByTestId('tile-content')).toBeInTheDocument();
    expect(screen.getByTestId('tile-wrapper')).toBeInTheDocument();
  });

  it('renders resize handle', () => {
    render(<DraggableTile {...mockProps} />);

    expect(screen.getByTestId('icon-resize')).toBeInTheDocument();
  });

  it('applies theme classes to resize handle', () => {
    render(<DraggableTile {...mockProps} />);

    const resizeHandle = screen.getByTestId('icon-resize').closest('div');
    expect(resizeHandle).toHaveClass('bg-theme-secondary');
  });

  it('sets up drag handle props', () => {
    render(<DraggableTile {...mockProps} />);

    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toHaveAttribute('draggable', 'true');
  });

  it('renders with correct positioning', () => {
    render(<DraggableTile {...mockProps} />);

    const resizeHandle = screen.getByTitle('Resize tile');
    expect(resizeHandle).toHaveClass('absolute', 'bottom-0', 'right-0');
  });

  it('applies correct z-index to resize handle', () => {
    render(<DraggableTile {...mockProps} />);

    const resizeHandle = screen.getByTitle('Resize tile');
    expect(resizeHandle).toHaveClass('z-20');
  });
});
