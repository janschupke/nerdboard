import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TileGrid } from './TileGrid';
import { DashboardProvider } from '../../contexts/DashboardContext';

// Mock Tile component
vi.mock('./Tile', () => ({
  Tile: ({ tile }: { tile: Record<string, unknown> }) => (
    <div data-testid={`tile-${tile.id as string}`}>{tile.type as string} Tile</div>
  ),
}));

// Mock DraggableTile component
vi.mock('./DraggableTile', () => ({
  DraggableTile: ({
    children,
    tile,
  }: {
    children: React.ReactNode;
    tile: Record<string, unknown>;
  }) => <div data-testid={`draggable-tile-${tile.id as string}`}>{children}</div>,
}));

describe('TileGrid', () => {
  it('renders empty state when no tiles', () => {
    render(
      <DashboardProvider>
        <TileGrid />
      </DashboardProvider>,
    );

    expect(screen.getByText('Welcome to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add tiles from the sidebar to get started')).toBeInTheDocument();
    expect(screen.getByText('Click the menu button to open the sidebar')).toBeInTheDocument();
  });

  it.skip('renders empty state with correct styling', () => {
    render(
      <DashboardProvider>
        <TileGrid />
      </DashboardProvider>,
    );

    const container = screen.getByText('Welcome to Dashboard').closest('div');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
  });

  it('renders empty state with theme classes', () => {
    render(
      <DashboardProvider>
        <TileGrid />
      </DashboardProvider>,
    );

    const heading = screen.getByText('Welcome to Dashboard');
    expect(heading).toHaveClass('text-theme-primary');

    const paragraph = screen.getByText('Add tiles from the sidebar to get started');
    expect(paragraph).toHaveClass('text-theme-secondary');
  });

  it('renders with correct layout structure', () => {
    render(
      <DashboardProvider>
        <TileGrid />
      </DashboardProvider>,
    );

    const mainContainer = screen.getByText('Welcome to Dashboard').closest('div')?.parentElement;
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
  });
});
