import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DragboardProvider } from './DragboardProvider';
import { DragboardTile } from './DragboardTile';
import type { DragboardConfig } from './DragboardContext';

const mockConfig: DragboardConfig = {
  columns: 4,
  rows: 3,
  tileSizes: {
    small: { colSpan: 1, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 2 },
    large: { colSpan: 3, rowSpan: 3 },
  },
  breakpoints: { sm: 640, md: 768, lg: 1024 },
};

describe('DragboardTile', () => {
  it('renders children', () => {
    const { getByText } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardTile id="tile-1" position={{ x: 1, y: 2 }} size="medium">
          <div>Tile Content</div>
        </DragboardTile>
      </DragboardProvider>,
    );
    expect(getByText('Tile Content')).toBeInTheDocument();
  });

  it('applies correct grid styles from config', () => {
    const { getByRole } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardTile id="tile-2" position={{ x: 1, y: 2 }} size="large">
          <div>Tile</div>
        </DragboardTile>
      </DragboardProvider>,
    );
    const tile = getByRole('gridcell');
    expect(tile).toHaveStyle('grid-column: 2 / span 3');
    expect(tile).toHaveStyle('grid-row: 3 / span 3');
  });

  it('uses Tailwind classes for styling', () => {
    const { getByRole } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardTile id="tile-3" position={{ x: 0, y: 0 }} size="small">
          <div>Tile</div>
        </DragboardTile>
      </DragboardProvider>,
    );
    const tile = getByRole('gridcell');
    expect(tile.className).toMatch(/bg-surface-primary/);
    expect(tile.className).toMatch(/border-theme-primary/);
    expect(tile.className).toMatch(/rounded-lg/);
  });
});
