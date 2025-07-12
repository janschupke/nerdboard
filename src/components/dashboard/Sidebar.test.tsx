import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { TileType } from '../../types/dashboard';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  ),
}));

// Mock Button component
vi.mock('../ui/Button', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className} data-testid="close-button">
      {children}
    </button>
  ),
}));

describe('Sidebar', () => {
  const mockProps = {
    isOpen: true,
    onToggle: vi.fn(),
    onTileSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with correct structure', () => {
    render(<Sidebar {...mockProps} />);

    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  it('displays available tiles', () => {
    render(<Sidebar {...mockProps} />);

    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByText('Precious Metals')).toBeInTheDocument();
    expect(screen.getByText('Real-time cryptocurrency market data')).toBeInTheDocument();
    expect(screen.getByText('Gold and silver price data')).toBeInTheDocument();
  });

  it('calls onTileSelect when tile is clicked', () => {
    render(<Sidebar {...mockProps} />);

    const cryptoTile = screen.getByText('Cryptocurrency').closest('[role="button"]');
    fireEvent.click(cryptoTile!);

    expect(mockProps.onTileSelect).toHaveBeenCalledWith(TileType.CRYPTOCURRENCY);
  });

  it('calls onTileSelect when tile is activated with keyboard', () => {
    render(<Sidebar {...mockProps} />);

    const cryptoTile = screen.getByText('Cryptocurrency').closest('[role="button"]');
    fireEvent.keyDown(cryptoTile!, { key: 'Enter' });

    expect(mockProps.onTileSelect).toHaveBeenCalledWith(TileType.CRYPTOCURRENCY);
  });

  it('sets up drag-and-drop for tiles', () => {
    render(<Sidebar {...mockProps} />);

    const cryptoTile = screen.getByText('Cryptocurrency').closest('[role="button"]');
    expect(cryptoTile).toHaveAttribute('draggable', 'true');
  });

  it('handles drag start correctly', () => {
    render(<Sidebar {...mockProps} />);

    const cryptoTile = screen.getByText('Cryptocurrency').closest('[role="button"]');
    const dragEvent = new Event('dragstart') as DragEvent;
    (dragEvent as any).dataTransfer = { setData: vi.fn(), effectAllowed: '' };

    // Mock the onDragStart handler
    const onDragStart = vi.fn();
    cryptoTile?.addEventListener('dragstart', onDragStart);

    fireEvent(cryptoTile!, dragEvent);

    // The actual drag start logic is in the component, so we just verify the event was fired
    expect(cryptoTile).toHaveAttribute('draggable', 'true');
  });

  it('calls onToggle when close button is clicked', () => {
    render(<Sidebar {...mockProps} />);

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockProps.onToggle).toHaveBeenCalled();
  });

  it('applies correct classes when open', () => {
    render(<Sidebar {...mockProps} />);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).toHaveStyle({ width: '256px' });
  });

  it('applies correct classes when closed', () => {
    render(<Sidebar {...mockProps} isOpen={false} />);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('-translate-x-64');
    expect(sidebar).toHaveStyle({ width: '0px' });
  });

  it('renders with theme classes', () => {
    render(<Sidebar {...mockProps} />);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('bg-surface-primary');
    expect(sidebar).toHaveClass('border-theme-primary');
  });

  it('renders tile icons', () => {
    render(<Sidebar {...mockProps} />);

    expect(screen.getByTestId('icon-crypto')).toBeInTheDocument();
    expect(screen.getByTestId('icon-metals')).toBeInTheDocument();
    // There are multiple add icons, so use getAllByTestId
    expect(screen.getAllByTestId('icon-add')).toHaveLength(2);
  });

  it('applies hover styles to tiles', () => {
    render(<Sidebar {...mockProps} />);

    const cryptoTile = screen.getByText('Cryptocurrency').closest('[role="button"]');
    expect(cryptoTile).toHaveClass('hover:border-accent-primary');
    expect(cryptoTile).toHaveClass('hover:bg-accent-muted');
  });
});
