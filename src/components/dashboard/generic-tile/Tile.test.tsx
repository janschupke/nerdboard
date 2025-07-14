import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenericTile } from './GenericTile';
import type { DashboardTile } from '../../../types/dashboard';
import { DashboardProvider } from '../../../contexts/DashboardContext';

const defaultMeta = { title: 'Test Tile', icon: 'test-icon' };

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

function renderWithProvider(ui: React.ReactElement) {
  return render(<DashboardProvider>{ui}</DashboardProvider>);
}

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

  it.skip('renders tile with correct structure', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} {...mockProps} />);

    expect(screen.getByTestId('cryptocurrency-tile')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByTestId('icon-crypto')).toBeInTheDocument();
  });

  it.skip('renders precious metals tile correctly', () => {
    const metalsTile: DashboardTile = {
      id: 'test-tile-2',
      type: 'precious-metals',
      position: { x: 1, y: 0 },
      size: 'large',
      config: {},
    };

    renderWithProvider(
      <GenericTile meta={defaultMeta} tile={metalsTile} onRemove={mockProps.onRemove} />,
    );

    expect(screen.getByTestId('precious-metals-tile')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByTestId('icon-metals')).toBeInTheDocument();
  });

  it.skip('applies correct size styles', () => {
    const largeTile: DashboardTile = {
      id: 'test-tile-large',
      type: 'cryptocurrency',
      position: { x: 1, y: 1 },
      size: 'large',
      config: {},
    };

    renderWithProvider(
      <GenericTile meta={defaultMeta} tile={largeTile} onRemove={mockProps.onRemove} />,
    );

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveStyle({
      gridColumn: '2 / span 4',
      gridRow: '2 / span 1',
    });
  });

  it.skip('calls onRemove when close button is clicked', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} {...mockProps} />);

    const closeButton = screen.getByLabelText('Remove Cryptocurrency tile');
    fireEvent.click(closeButton);

    expect(mockProps.onRemove).toHaveBeenCalledWith('test-tile-1');
  });

  it.skip('does not render close button when onRemove is not provided', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} tile={mockTile} />);

    expect(screen.queryByLabelText('Remove Cryptocurrency tile')).not.toBeInTheDocument();
  });

  it.skip('renders drag handle with correct attributes', () => {
    const dragHandleProps = {
      draggable: true,
      onDragStart: vi.fn(),
      'aria-label': 'Drag Cryptocurrency tile',
      className: 'cursor-grab',
    };

    renderWithProvider(
      <GenericTile meta={defaultMeta} {...mockProps} dragHandleProps={dragHandleProps} />,
    );

    const dragHandle = screen.getByLabelText('Drag Cryptocurrency tile');
    expect(dragHandle).toHaveClass('cursor-grab');
  });

  it.skip('applies theme classes correctly', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} {...mockProps} />);

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveClass('bg-surface-primary');
    expect(tileElement).toHaveClass('border-theme-primary');
  });

  it.skip('renders header with theme classes', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} {...mockProps} />);

    const header = screen.getByText('Cryptocurrency').closest('div')?.parentElement;
    expect(header).toHaveClass('bg-surface-secondary');
    expect(header).toHaveClass('border-theme-primary');
  });

  it.skip('renders unknown tile type with error message', () => {
    const unknownTile: DashboardTile = {
      id: 'test-tile-3',
      type: 'unknown' as DashboardTile['type'],
      position: { x: 0, y: 0 },
      size: 'medium',
      config: {},
    };

    renderWithProvider(
      <GenericTile meta={defaultMeta} tile={unknownTile} onRemove={mockProps.onRemove} />,
    );

    expect(screen.getByText('Unknown tile type: unknown')).toBeInTheDocument();
  });

  it.skip('renders custom children when provided', () => {
    renderWithProvider(
      <GenericTile meta={defaultMeta} {...mockProps}>
        <div data-testid="custom-content">Custom Content</div>
      </GenericTile>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByTestId('cryptocurrency-tile')).not.toBeInTheDocument();
  });

  it.skip('applies drag handle props when provided', () => {
    const dragHandleProps = {
      draggable: true,
      onDragStart: vi.fn(),
    };

    renderWithProvider(
      <GenericTile meta={defaultMeta} {...mockProps} dragHandleProps={dragHandleProps} />,
    );

    // The drag handle is now on the header, not the main tile element
    const header = screen.getByText('Cryptocurrency').closest('div')?.parentElement;
    expect(header).toHaveAttribute('draggable', 'true');
  });

  it.skip('renders with correct data attributes', () => {
    renderWithProvider(<GenericTile meta={defaultMeta} {...mockProps} />);

    const tileElement = screen.getByTestId('cryptocurrency-tile').closest('[data-tile-id]');
    expect(tileElement).toHaveAttribute('data-tile-id', 'test-tile-1');
    expect(tileElement).toHaveAttribute('data-tile-type', 'cryptocurrency');
  });
});
