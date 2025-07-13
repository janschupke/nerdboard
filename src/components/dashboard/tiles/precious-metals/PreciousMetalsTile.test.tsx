import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PreciousMetalsTile } from './PreciousMetalsTile';
import { TileSize } from '../../../../types/dashboard';
import * as preciousMetalsApiModule from './services/preciousMetalsApi';

describe('PreciousMetalsTile', () => {
  const baseProps = {
    id: 'test',
    size: TileSize.MEDIUM,
    config: {},
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<PreciousMetalsTile {...baseProps} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    vi.spyOn(
      preciousMetalsApiModule.PreciousMetalsApiService.prototype,
      'getPreciousMetalsData',
    ).mockResolvedValue({
      gold: { price: 1950.5, change_24h: 12.3, change_percentage_24h: 0.63 },
      silver: { price: 24.75, change_24h: -0.15, change_percentage_24h: -0.6 },
    });
    render(<PreciousMetalsTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText('Silver')).toBeInTheDocument();
      expect(screen.getByText('$1,950.50')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    vi.spyOn(
      preciousMetalsApiModule.PreciousMetalsApiService.prototype,
      'getPreciousMetalsData',
    ).mockRejectedValue(new Error('Failed to load precious metals data'));
    render(<PreciousMetalsTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load precious metals data/i)).toBeInTheDocument();
    });
  });
});
