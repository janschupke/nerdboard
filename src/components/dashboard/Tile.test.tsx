import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tile } from './Tile';
import type { DashboardTile } from '../../types/dashboard';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  ),
}));

// Mock tile components
vi.mock('./tiles/cryptocurrency/CryptocurrencyTile', () => ({
  CryptocurrencyTile: ({ id }: { id: string }) => (
    <div data-testid="cryptocurrency-tile">Crypto Tile {id}</div>
  ),
}));

vi.mock('./tiles/precious-metals/PreciousMetalsTile', () => ({
  PreciousMetalsTile: ({ id }: { id: string }) => (
    <div data-testid="precious-metals-tile">Metals Tile {id}</div>
  ),
}));

describe('Tile', () => {
  const mockTile: DashboardTile = {
    id: 'test-tile-1',
    type: 'cryptocurrency',
    position: { x: 0, y: 0 },
    size: 'medium',
    config: {},
  };

  const mockProps = {
    tile: mockTile,
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tile with correct structure', () => {
    render(<Tile {...mockProps} />);

    expect(screen.getByTestId('cryptocurrency-tile')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByTestId('icon-crypto')).toBeInTheDocument();
  });

  it('renders precious metals tile correctly', () => {
    const metalsTile: DashboardTile = {
      id: 'test-tile-2',
      type: 'precious-metals',
      position: { x: 1, y: 0 },
      size: 'large',
      config: {},
    };

    render(<Tile tile={metalsTile} onRemove={mockProps.onRemove} />);

    expect(screen.getByTestId('precious-metals-tile')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByTestId('icon-metals')).toBeInTheDocument();
  });

  it('applies correct size styles', () => {
    const largeTile: DashboardTile = {
      id: 'test-tile-large',
      type: 'cryptocurrency',
      position: { x: 1, y: 1 },
      size: 'large',
      config: {},
    };

    render(<Tile tile={largeTile} onRemove={mockProps.onRemove} />);

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveStyle({ 
      gridColumn: '2 / span 4', 
      gridRow: '2 / span 1' 
    });
  });

  it('calls onRemove when close button is clicked', () => {
    render(<Tile {...mockProps} />);

    const closeButton = screen.getByLabelText('Remove Cryptocurrency tile');
    fireEvent.click(closeButton);

    expect(mockProps.onRemove).toHaveBeenCalledWith('test-tile-1');
  });

  it('does not render close button when onRemove is not provided', () => {
    render(<Tile tile={mockTile} />);

    expect(screen.queryByLabelText('Remove Cryptocurrency tile')).not.toBeInTheDocument();
  });

  it('renders drag handle with correct attributes', () => {
    const dragHandleProps = {
      draggable: true,
      onDragStart: vi.fn(),
      'aria-label': 'Drag Cryptocurrency tile',
      className: 'cursor-grab',
    };

    render(<Tile {...mockProps} dragHandleProps={dragHandleProps} />);

    const dragHandle = screen.getByLabelText('Drag Cryptocurrency tile');
    expect(dragHandle).toHaveClass('cursor-grab');
  });

  it('applies theme classes correctly', () => {
    render(<Tile {...mockProps} />);

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveClass('bg-surface-primary');
    expect(tileElement).toHaveClass('border-theme-primary');
  });

  it('renders header with theme classes', () => {
    render(<Tile {...mockProps} />);

    const header = screen.getByText('Cryptocurrency').closest('div')?.parentElement;
    expect(header).toHaveClass('bg-surface-secondary');
    expect(header).toHaveClass('border-theme-primary');
  });

  it('renders unknown tile type with error message', () => {
    const unknownTile: DashboardTile = {
      id: 'test-tile-3',
      type: 'unknown' as DashboardTile['type'],
      position: { x: 0, y: 0 },
      size: 'medium',
      config: {},
    };

    render(<Tile tile={unknownTile} onRemove={mockProps.onRemove} />);

    expect(screen.getByText('Unknown tile type: unknown')).toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(
      <Tile {...mockProps}>
        <div data-testid="custom-content">Custom Content</div>
      </Tile>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByTestId('cryptocurrency-tile')).not.toBeInTheDocument();
  });

  it('applies drag handle props when provided', () => {
    const dragHandleProps = {
      draggable: true,
      onDragStart: vi.fn(),
    };

    render(<Tile {...mockProps} dragHandleProps={dragHandleProps} />);

    // The drag handle is now on the header, not the main tile element
    const header = screen.getByText('Cryptocurrency').closest('div')?.parentElement;
    expect(header).toHaveAttribute('draggable', 'true');
  });

  it('renders with correct data attributes', () => {
    render(<Tile {...mockProps} />);

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveAttribute('data-tile-id', 'test-tile-1');
    expect(tileElement).toHaveAttribute('data-tile-type', 'cryptocurrency');
  });
});
