import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DragboardProvider } from './DragboardProvider';
import { DragboardGrid } from './DragboardGrid';
import type { DragboardConfig } from './DragboardContext';

const mockConfig: DragboardConfig = {
  columns: 3,
  rows: 2,
  tileSizes: {
    small: { colSpan: 1, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 2 },
    large: { colSpan: 3, rowSpan: 2 },
  },
  breakpoints: { sm: 640, md: 768, lg: 1024 },
};

describe('DragboardGrid', () => {
  it('renders children in a grid', () => {
    const { getByTestId } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardGrid>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </DragboardGrid>
      </DragboardProvider>,
    );
    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
  });

  it('applies correct grid columns and rows from config', () => {
    const { getByTestId } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardGrid>
          <div data-testid="child" />
        </DragboardGrid>
      </DragboardProvider>,
    );
    const grid = getByTestId('dragboard-grid');
    expect(grid).toHaveStyle('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(grid).toHaveStyle('grid-template-rows: repeat(2, minmax(8vw, 1fr))');
  });

  it('uses Tailwind classes for layout', () => {
    const { getByTestId } = render(
      <DragboardProvider config={mockConfig}>
        <DragboardGrid>
          <div data-testid="child" />
        </DragboardGrid>
      </DragboardProvider>,
    );
    const grid = getByTestId('dragboard-grid');
    expect(grid.className).toMatch(/w-full/);
    expect(grid.className).toMatch(/h-full/);
    expect(grid.className).toMatch(/p-4/);
  });
});
