import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DragboardProvider } from './DragboardProvider';
import type { DragboardConfig } from './DragboardContext';
import { useDragboard } from './DragboardContext';

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

describe('DragboardProvider', () => {
  it('provides config to children via useDragboard', () => {
    function TestComponent() {
      const { config } = useDragboard();
      return <div data-testid="config-columns">{config.columns}</div>;
    }
    render(
      <DragboardProvider config={mockConfig}>
        <TestComponent />
      </DragboardProvider>,
    );
    expect(screen.getByTestId('config-columns').textContent).toBe('4');
  });

  it('throws if useDragboard is called outside provider', () => {
    function TestComponent() {
      useDragboard();
      return <div>Should throw</div>;
    }
    expect(() => render(<TestComponent />)).toThrow();
  });
});
